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


function toggleStyles() {
  if (startBarPopupElement.style.display === 'none') {
    startBarPopupElement.style.display = 'block';
    applyStyles("1px solid black", "1px solid black", "1px solid white", "1px solid white", "inset 1px 1px 0 0 grey, inset 1px 1px 0 0 grey");
  } else {
    startBarPopupElement.style.display = 'none';
    applyStyles("1px solid white", "1px solid white", "1px solid black", "1px solid black", "inset -1px -1px 0 0 grey, inset -1px -1px 0 0 grey");
  }
}

function applyStyles(top, left, bottom, right, boxShadow) {
  startButtonElement.style.borderTop = top;
  startButtonElement.style.borderLeft = left;
  startButtonElement.style.borderBottom = bottom;
  startButtonElement.style.borderRight = right;
  startButtonElement.style.boxShadow = boxShadow;
}

// Add click event listener to the start button
startButtonElement.addEventListener('click', toggleStyles);

// Add click event listener to the body to hide the target element
desktopElement.addEventListener('click', function () {
  startBarPopupElement.style.display = 'none';
  applyStyles("1px solid white", "1px solid white", "1px solid black", "1px solid black", "inset -1px -1px 0 0 grey, inset -1px -1px 0 0 grey");
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

function focusWindow(target) {
    const others = Array.from(windows).filter(w => w !== target);
    others
      .map(el => ({ el, z: parseInt(el.style.zIndex, 10) || 0 }))
      .sort((a, b) => a.z - b.z)
      .forEach((entry, i) => { entry.el.style.zIndex = i + 1; });
    target.style.zIndex = WINDOW_Z_MAX;
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
  myComputer: { defaultTop: '40%', defaultLeft: '35%' },
  helpFolder: { defaultTop: '30%', defaultLeft: '50%' },
  recycleBin: { defaultTop: '25%', defaultLeft: '55%' },
};

function showWindowById(id) {
  const el = document.getElementById(id);
  if (!el) return;
  showWindow(el);
}

function hideWindowById(id) {
  resetPopupsAndOptions();
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'none';
}

function closeWindowById(id) {
  resetPopupsAndOptions();
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'none';
  const config = WINDOW_REGISTRY[id];
  if (config) {
    el.style.top = config.defaultTop;
    el.style.left = config.defaultLeft;
  }
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

var editPopupBinElement = document.getElementById('editPopupBin');
var filePopupBinElement = document.getElementById('filePopupBin');
var viewPopupBinElement = document.getElementById('viewPopupBin');
var helpPopupBinElement = document.getElementById('helpPopupBin');

var editPopupHelpElement =  document.getElementById('editPopupHelp');
var filePopupHelpElement =  document.getElementById('filePopupHelp');
var viewPopupHelpElement =  document.getElementById('viewPopupHelp');
var helpPopupHelpElement =  document.getElementById('helpPopupHelp');

function resetPopupsAndOptions() {
  var popups = [editPopupBinElement, filePopupBinElement, viewPopupBinElement, helpPopupBinElement, editPopupHelpElement, filePopupHelpElement, viewPopupHelpElement, helpPopupHelpElement];
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
  let startX = 0, startY = 0, startTop = 0, startLeft = 0;

  handle.addEventListener('pointerdown', onPointerDown);

  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();
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
    elmnt.style.top = (startTop + (e.clientY - startY)) + "px";
    elmnt.style.left = (startLeft + (e.clientX - startX)) + "px";
  }

  function onPointerUp(e) {
    handle.releasePointerCapture(e.pointerId);
    handle.removeEventListener('pointermove', onPointerMove);
    handle.removeEventListener('pointerup', onPointerUp);
    handle.removeEventListener('pointercancel', onPointerUp);
  }
}
