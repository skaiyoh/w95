const displayTime = document.querySelector(".display-time");
const windows = document.querySelectorAll('.window');

// Time
function showTime() {
  let time = new Date();
  let hours = time.getHours().toString().padStart(2, '0');
  let minutes = time.getMinutes().toString().padStart(2, '0');

  hours = (hours % 12) || 12;

  displayTime.innerText = `${hours}:${minutes}`;
  setTimeout(showTime, 1000);
}

showTime();

var startBarPopupElement = document.getElementById("startPopup");
var startButtonElement = document.getElementById("startButton");
var desktopElement = document.querySelector(".desktop");


// Win95 bevel states for the Start button (inline styles override style.css).
const PRESSED = {
  borderTop: "2px solid black",
  borderLeft: "2px solid black",
  borderBottom: "2px solid white",
  borderRight: "2px solid white",
  boxShadow: "inset 2px 2px 0 0 grey",
};

const RAISED = {
  borderTop: "2px solid white",
  borderLeft: "2px solid white",
  borderBottom: "2px solid black",
  borderRight: "2px solid black",
  boxShadow: "inset -2px -2px 0 0 grey",
};

function toggleStyles() {
  if (startBarPopupElement.style.display === 'none') {
    startBarPopupElement.style.display = 'block';
    applyStyles(PRESSED);
  } else {
    startBarPopupElement.style.display = 'none';
    applyStyles(RAISED);
  }
}

function applyStyles(style) {
  Object.assign(startButtonElement.style, style);
}

// Add click event listener to the start button
startButtonElement.addEventListener('click', toggleStyles);

// Add click event listener to the body to hide the target element
desktopElement.addEventListener('click', function () {
  startBarPopupElement.style.display = 'none';
  applyStyles(RAISED);
});

// Stop propagation of click events on the button to prevent hiding immediately after showing
startButtonElement.addEventListener('click', function (event) {
  event.stopPropagation();
});
startBarPopupElement.addEventListener('click', function (event) {
  event.stopPropagation();
});

var myComputerElement = document.getElementById("myComputer");
var recycleBinElement = document.getElementById("recycleBin");
var helpFolderElement = document.getElementById("helpFolder");

// Taskbar sits at z-index 20 (style.css). Keep windows strictly below that.
const WINDOW_Z_MAX = 19;

let ACTIVE_WINDOW_ID = null;

function getTopVisibleWindow(excludeId) {
  let best = null;
  let bestZ = -1;
  windows.forEach(w => {
    if (w.id === excludeId) return;
    if (w.style.display === 'none') return;
    const z = parseInt(w.style.zIndex, 10) || 0;
    if (z > bestZ) { bestZ = z; best = w; }
  });
  return best;
}

function getTaskbarButton(id) {
  return document.getElementById('startBar' + id.charAt(0).toUpperCase() + id.slice(1));
}

function setActiveWindow(id) {
  if (id === ACTIVE_WINDOW_ID) return;
  if (ACTIVE_WINDOW_ID) {
    const prev = getTaskbarButton(ACTIVE_WINDOW_ID);
    if (prev) prev.classList.remove('is-active');
    const prevWin = document.getElementById(ACTIVE_WINDOW_ID);
    if (prevWin) prevWin.classList.remove('is-active');
  }
  ACTIVE_WINDOW_ID = id;
  if (id) {
    const next = getTaskbarButton(id);
    if (next) next.classList.add('is-active');
    const nextWin = document.getElementById(id);
    if (nextWin) nextWin.classList.add('is-active');
  }
}

function showTaskbarButton(id) {
  const btn = getTaskbarButton(id);
  if (btn) btn.classList.remove('is-hidden');
}

function hideTaskbarButton(id) {
  const btn = getTaskbarButton(id);
  if (btn) btn.classList.add('is-hidden');
}

function focusWindow(target) {
    const others = Array.from(windows).filter(w => w !== target);
    others
      .map(el => ({ el, z: parseInt(el.style.zIndex, 10) || 0 }))
      .sort((a, b) => a.z - b.z)
      .forEach((entry, i) => { entry.el.style.zIndex = i + 1; });
    target.style.zIndex = WINDOW_Z_MAX;
    setActiveWindow(target.id);
}

function updateZIndex(event) {
    focusWindow(event.currentTarget);
}

function showWindow(windowElement) {
    windowElement.style.display = "flex";
    focusWindow(windowElement);
}

windows.forEach((win, i) => {
    // pointerdown, not mousedown: the header's drag handler calls preventDefault()
    // which suppresses the compatibility mousedown and would otherwise skip focus.
    win.addEventListener('pointerdown', updateZIndex);
    win.style.zIndex = i + 1;
});


const WINDOW_REGISTRY = {
  myComputer: { defaultTop: '40%', defaultLeft: '35%', defaultTransform: 'translate(-35%, -40%)' },
  helpFolder: { defaultTop: '30%', defaultLeft: '50%', defaultTransform: 'translate(-50%, -30%)' },
  recycleBin: { defaultTop: '25%', defaultLeft: '55%', defaultTransform: 'translate(-55%, -25%)' },
};

const MINIMIZED_WINDOWS = new Set();
const ANIMATING_WINDOWS = new Set();

function domRectToZoom(r) {
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

function getIconRectForWindow(id) {
  const icon = document.querySelector(
    'a[data-action="show-window"][data-window="' + id + '"]'
  );
  if (!icon) return null;
  return domRectToZoom(icon.getBoundingClientRect());
}

function getTaskbarRectForWindow(id) {
  const slot = document.getElementById(
    'startBar' + id.charAt(0).toUpperCase() + id.slice(1)
  );
  if (slot) {
    const r = slot.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return domRectToZoom(r);
  }
  return { x: 80, y: window.innerHeight - 32, w: 140, h: 22 };
}

function measureWindowRect(el) {
  const prevDisplay = el.style.display;
  const prevVisibility = el.style.visibility;
  try {
    el.style.visibility = 'hidden';
    el.style.display = 'flex';
    return domRectToZoom(el.getBoundingClientRect());
  } finally {
    el.style.display = prevDisplay;
    el.style.visibility = prevVisibility;
  }
}

function runZoom(src, dst) {
  if (!window.W95Zoom || !src || !dst) return Promise.resolve();
  return window.W95Zoom.run(src, dst);
}

function showWindowById(id) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.style.display && el.style.display !== 'none') {
    showWindow(el);
    return;
  }
  if (ANIMATING_WINDOWS.has(id)) return;

  const src = MINIMIZED_WINDOWS.has(id)
    ? getTaskbarRectForWindow(id)
    : getIconRectForWindow(id);
  const dst = measureWindowRect(el);

  showTaskbarButton(id);
  ANIMATING_WINDOWS.add(id);
  runZoom(src, dst).then(() => {
    showWindow(el);
    MINIMIZED_WINDOWS.delete(id);
    ANIMATING_WINDOWS.delete(id);
  });
}

function hideWindowById(id) {
  resetPopupsAndOptions();
  const el = document.getElementById(id);
  if (!el) return;
  if (!el.style.display || el.style.display === 'none') return;
  if (ANIMATING_WINDOWS.has(id)) return;

  const src = domRectToZoom(el.getBoundingClientRect());
  const dst = getTaskbarRectForWindow(id);
  el.style.display = 'none';
  if (ACTIVE_WINDOW_ID === id) {
    const next = getTopVisibleWindow(id);
    setActiveWindow(next ? next.id : null);
  }

  ANIMATING_WINDOWS.add(id);
  runZoom(src, dst).then(() => {
    MINIMIZED_WINDOWS.add(id);
    ANIMATING_WINDOWS.delete(id);
  });
}

function closeWindowById(id) {
  resetPopupsAndOptions();
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'none';
  MINIMIZED_WINDOWS.delete(id);
  if (ACTIVE_WINDOW_ID === id) {
    const next = getTopVisibleWindow(id);
    setActiveWindow(next ? next.id : null);
  }
  hideTaskbarButton(id);
  const config = WINDOW_REGISTRY[id];
  if (config) {
    el.style.top = config.defaultTop;
    el.style.left = config.defaultLeft;
    el.style.transform = config.defaultTransform || '';
  }
}

function handleTaskbarClick(id) {
  if (ANIMATING_WINDOWS.has(id)) return;
  if (MINIMIZED_WINDOWS.has(id)) {
    showWindowById(id);
    return;
  }
  if (ACTIVE_WINDOW_ID === id) {
    hideWindowById(id);
    return;
  }
  const el = document.getElementById(id);
  if (el) focusWindow(el);
}

const WINDOW_ACTIONS = {
  'show-window': showWindowById,
  'hide-window': hideWindowById,
  'close-window': closeWindowById,
};

desktopElement.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-action]');
  if (!trigger) return;
  const action = WINDOW_ACTIONS[trigger.dataset.action];
  const id = trigger.dataset.window;
  if (!action || !id) return;
  e.preventDefault();
  action(id);
});

const activeAppsElement = document.querySelector('.activeApps');
if (activeAppsElement) {
  activeAppsElement.addEventListener('click', (e) => {
    const btn = e.target.closest('.taskbarButton');
    if (!btn) return;
    const id = btn.dataset.window;
    if (id) handleTaskbarClick(id);
  });
}

var editPopupBinElement = document.getElementById('editPopupBin');
var filePopupBinElement = document.getElementById('filePopupBin');
var viewPopupBinElement = document.getElementById('viewPopupBin');
var helpPopupBinElement = document.getElementById('helpPopupBin');

var editPopupHelpElement =  document.getElementById('editPopupHelp');
var filePopupHelpElement =  document.getElementById('filePopupHelp');
var viewPopupHelpElement =  document.getElementById('viewPopupHelp');
var helpPopupHelpElement =  document.getElementById('helpPopupHelp');

var editPopupMCElement = document.getElementById('editPopupMC');
var filePopupMCElement = document.getElementById('filePopupMC');
var viewPopupMCElement = document.getElementById('viewPopupMC');
var helpPopupMCElement = document.getElementById('helpPopupMC');

function resetPopupsAndOptions() {
  var popups = [editPopupBinElement, filePopupBinElement, viewPopupBinElement, helpPopupBinElement, editPopupHelpElement, filePopupHelpElement, viewPopupHelpElement, helpPopupHelpElement, editPopupMCElement, filePopupMCElement, viewPopupMCElement, helpPopupMCElement];
  popups.forEach(function(popup) {
      popup.style.display = 'none';
  });

  var options = document.querySelectorAll('.selectOption');
  options.forEach(function(option) {
      option.classList.remove('selectOptionActive');
  });
}

function togglePopup(popupElement, context) {
  var isActive = context.classList.contains('selectOptionActive');

  // Reset all first
  resetPopupsAndOptions();

  // Then, toggle the current popup and option based on its previous state
  if (isActive) {
      // If it was active, it's now been turned off by resetPopupsAndOptions, so do nothing more
  } else {
      // If it wasn't active, display it and mark as active
      var triggerLeft = context.getBoundingClientRect().left;
      var parentLeft = context.parentElement.getBoundingClientRect().left;
      popupElement.style.marginLeft = (triggerLeft - parentLeft) + 'px';
      popupElement.style.display = 'block';
      context.classList.add('selectOptionActive');
  }
}

function closePopupsOnOutsidePointerDown(event) {
  if (!document.querySelector('.selectOptionActive')) return;
  if (!(event.target instanceof Element)) return;
  if (event.target.closest('.selectOption[data-popup], .selectBarPopups')) return;
  resetPopupsAndOptions();
}

document.addEventListener('pointerdown', closePopupsOnOutsidePointerDown);

document.querySelectorAll('.selectBar').forEach(bar => {
  bar.addEventListener('click', (e) => {
    const trigger = e.target.closest('.selectOption[data-popup]');
    if (!trigger) return;
    const popup = document.getElementById(trigger.dataset.popup);
    if (popup) togglePopup(popup, trigger);
  });
});

windows.forEach(dragElement);

function dragElement(elmnt) {
  const handle = elmnt.querySelector(".windowHeader") || elmnt;
  const startBar = document.querySelector('.startBar');
  let startX = 0, startY = 0, startTop = 0, startLeft = 0;

  handle.addEventListener('pointerdown', onPointerDown);

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest('.popupActionButtons')) return;
    e.preventDefault();

    const computed = getComputedStyle(elmnt);
    if (computed.transform && computed.transform !== 'none') {
      const rect = elmnt.getBoundingClientRect();
      elmnt.style.transform = 'none';
      elmnt.style.top = rect.top + 'px';
      elmnt.style.left = rect.left + 'px';
    }

    startX = e.clientX;
    startY = e.clientY;
    startTop = elmnt.offsetTop;
    startLeft = elmnt.offsetLeft;
    handle.setPointerCapture(e.pointerId);
    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);
    handle.addEventListener('pointercancel', onPointerUp);
  }

  function onPointerMove(e) {
    const newTop = startTop + (e.clientY - startY);
    const newLeft = startLeft + (e.clientX - startX);
    const taskbarH = startBar ? startBar.offsetHeight : 0;
    const maxTop = Math.max(0, window.innerHeight - taskbarH - elmnt.offsetHeight);
    const maxLeft = Math.max(0, window.innerWidth - elmnt.offsetWidth);

    elmnt.style.top = Math.max(0, Math.min(newTop, maxTop)) + "px";
    elmnt.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + "px";
  }

  function onPointerUp(e) {
    handle.releasePointerCapture(e.pointerId);
    handle.removeEventListener('pointermove', onPointerMove);
    handle.removeEventListener('pointerup', onPointerUp);
    handle.removeEventListener('pointercancel', onPointerUp);
  }
}
