const displayTime = document.querySelector(".display-time");
const windows = document.querySelectorAll('.window');

// Time
function showTime() {
  let time = new Date();
  let hours = time.getHours().toString().padStart(2, '0');
  let minutes = time.getMinutes().toString().padStart(2, '0');
  let ampm = hours >= 12 ? 'PM' : 'AM';

  // Convert hours to 12-hour format
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

// Initialize variable to store the last selected window
let lastSelectedWindow = null;

// Global variable to store the current highest z-index
let highestZIndex = 1;

// Function to update z-index on mousedown
function updateZIndex(event) {
    // Get the clicked window
    const clickedWindow = event.currentTarget;

    // Set the z-index of the clicked window to the highest value + 1
    clickedWindow.style.zIndex = highestZIndex++;

    // Update last selected window
    lastSelectedWindow = clickedWindow;
}

// Function to show a specific window and bring it to the front
function showWindow(windowElement) {
    // Set display property to "flex"
    windowElement.style.display = "flex";

    // Bring the window to the front by updating z-index
    updateZIndex({ currentTarget: windowElement });
}

// Add mousedown event listener to each window
windows.forEach(window => {
    window.addEventListener('mousedown', updateZIndex);

    // Initialize z-index for each window in order
    window.style.zIndex = highestZIndex++;
});


// Use these functions to show the respective windows
function showMyComputer() {
    showWindow(myComputerElement);
}
function hideMyComputer() {
  myComputerElement.style.display = "none";
}
function closeMyComputer() {
  myComputerElement.style.display = "none";
  myComputerElement.style.top = "40%";
  myComputerElement.style.left = "35%";
}


function showHelpFolder() {
  showWindow(helpFolderElement);
}

function hideHelpFolder() {
  helpFolderElement.style.display = "none";
}

function closeHelpFolder() {
  helpFolderElement.style.display = "none";
  helpFolderElement.style.top = "30%";
  helpFolderElement.style.left = "50%";
}


function showRecycleBin() {
    showWindow(recycleBinElement);
}
function hideRecycleBin() {
  recycleBinElement.style.display = "none";
}
function closeRecycleBin() {
  recycleBinElement.style.display = "none";
  recycleBinElement.style.top = "25%";
  recycleBinElement.style.left = "55%";
}

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

// Updated toggle functions using the new togglePopup utility
function toggleFilePopupBin() {
  togglePopup(filePopupBinElement, this);
}
function toggleEditPopupBin() {
  togglePopup(editPopupBinElement, this);
}
function toggleViewPopupBin() {
  togglePopup(viewPopupBinElement, this);
}
function toggleHelpPopupBin() {
  togglePopup(helpPopupBinElement, this);
}


function toggleFilePopupHelp() {
  togglePopup(filePopupHelpElement, this);
}

function toggleEditPopupHelp() {
  togglePopup(editPopupHelpElement, this);
}

function toggleViewPopupHelp() {
  togglePopup(viewPopupHelpElement, this);
}

function toggleHelpPopupHelp() {
  togglePopup(helpPopupHelpElement, this);
}

// Make all Window elements draggable:
windows.forEach(dragElement);

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  var header = elmnt.querySelector(".windowHeader");

  if (header) {
    // if present, the header is where you move the DIV from:
    header.onmousedown = dragMouseDown;
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // stop moving when the mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// //"object(s)" counter
// document.addEventListener("DOMContentLoaded", function() {
//   // Select all elements with the class 'folderObject'
//   var folderObjects = document.querySelectorAll('.folderObject');
  
//   // Count the elements
//   var count = folderObjects.length;

//   // Find the element with the class 'objectText' and update its text content
//   var objectTextElement = document.querySelector('.objectText');
//   if (objectTextElement) {
//       objectTextElement.textContent = count + ' object(s)';
//   }
// });
