console.log("Theme Switcher content script LOADED on:", window.location.href);

applySavedTheme();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("Message received:", request);

  if (request.action === "applyDarkTheme") {
    applyDarkTheme();
    saveTheme("dark");
  } else if (request.action === "applyLightTheme") {
    applyLightTheme();
    saveTheme("light");
  } else if (request.action === "resetTheme") {
    resetTheme();
    saveTheme("reset");
  }
});

/*theme functions*/

function applyDarkTheme() {
  document.body.style.backgroundColor = "#333";
  document.body.style.color = "white";
}

function applyLightTheme() {
  document.body.style.backgroundColor = "white";
  document.body.style.color = "black";
}

function resetTheme() {
  document.body.style.backgroundColor = "";
  document.body.style.color = "";
}

function saveTheme(themeName) {
  chrome.storage.local.set(
    {
      currentTheme: themeName,
    },
    function () {
      console.log("Theme saved:", themeName);
    }
  );
}

/*apply saved storage theme*/

function applySavedTheme() {
  chrome.storage.local.get(["currentTheme"], function (result) {
    const savedTheme = result.currentTheme;
    console.log("Loaded saved theme:", savedTheme);

    if (savedTheme === "dark") {
      applyDarkTheme();
    } else if (savedTheme === "light") {
      applyLightTheme();
    }
  });
}
