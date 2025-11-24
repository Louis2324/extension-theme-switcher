console.log(
  "Theme Switcher content script LOADED on:",
  window.location.href
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Message received:", request);

  if (request.action === "applyDarkTheme") {
    console.log("Applying dark theme...");
    document.body.style.backgroundColor = "#333";
    document.body.style.color = "white";
  } else if (request.action === "applyLightTheme") {
    console.log("Applying light theme...");
    document.body.style.backgroundColor = "white";
    document.body.style.color = "black";
  } else if (request.action === "resetTheme") {
    console.log("Resetting theme...");
    document.body.style.backgroundColor = "";
    document.body.style.color = "";
  }
});
