console.log("Popup opened!!");

console.log("Chrome object: ", chrome);
console.log("Chrome.tabs: ", chrome.tabs);

const selById = (id) => {
  return document.getElementById(id);
};

const darkBtn = selById("darkBtn");
const lightBtn = selById("lightBtn");
const resetBtn = selById("resetBtn");

darkBtn.addEventListener("click", function () {
  console.log("Dark mode btn clicked");

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "applyDarkTheme" });
  });
});

lightBtn.addEventListener("click", function () {
  console.log("Light mode btn clicked");

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "applyLightTheme" });
  });
});

resetBtn.addEventListener("click", function () {
  console.log("Theme reset clicked");
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "resetTheme" });
  });
});
