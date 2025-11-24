class AdvancedThemeEngine {
  constructor() {
    this.currentSite = window.location.hostname;
    this.originalStyles = new Map();
    this.nativeThemeSupport = null;
    this.init();
  }

  init() {
    console.log(`Smart Theme Engine loaded on: ${this.currentSite}`);
    this.detectNativeThemeSupport();
    this.storeOriginalState();
    this.setupMessageListener();
    this.applySavedTheme();
  }

  detectNativeThemeSupport() {
    console.log("Detecting native theme support...");

    this.nativeThemeSupport = {
      hasDataAttributes: this.detectDataAttributeTheming(),
      hasClassTheming: this.detectClassTheming(),
      hasCssVariables: this.detectCssVariables(),
    };

    console.log("Native theme support:", this.nativeThemeSupport);
  }

  detectDataAttributeTheming() {
    const dataAttrs = [
      "data-theme",
      "data-color-scheme",
      "data-mode",
      "data-color-mode",
      "data-bs-theme",
    ];
    return dataAttrs.some((attr) =>
      document.documentElement.hasAttribute(attr)
    );
  }

  detectClassTheming() {
    const themeClasses = [
      "dark",
      "light",
      "dark-mode",
      "light-mode",
      "theme-dark",
      "theme-light",
    ];
    return themeClasses.some(
      (className) =>
        document.documentElement.classList.contains(className) ||
        document.body.classList.contains(className)
    );
  }

  detectCssVariables() {
    const rootStyles = getComputedStyle(document.documentElement);
    const themeVars = [
      "--primary-color",
      "--background-color",
      "--text-color",
      "--bg-color",
      "--color-bg",
    ];
    return themeVars.some(
      (varName) => rootStyles.getPropertyValue(varName) !== ""
    );
  }

  storeOriginalState() {
    console.log("Storing original website state...");
    const bodyStyle = getComputedStyle(document.body);
    this.originalStyles.set("body", {
      backgroundColor: bodyStyle.backgroundColor,
      color: bodyStyle.color,
      element: document.body,
    });
    console.log("Original state stored");
  }

  applyAdaptiveDarkTheme() {
    console.log("Applying dark theme...");
    if (this.activateNativeDarkTheme()) {
      console.log("Used website's native dark theme");
    } else {
      console.log("No native dark theme found, using fallback");
      this.applyFallbackDarkTheme();
    }
  }

  applyAdaptiveLightTheme() {
    console.log("Applying light theme...");
    if (this.activateNativeLightTheme()) {
      console.log("Used website's native light theme");
    } else {
      console.log("No native light theme found, using fallback");
      this.applyFallbackLightTheme();
    }
  }

  activateNativeDarkTheme() {
    if (this.nativeThemeSupport.hasDataAttributes) {
      if (this.setDataAttributeTheme("dark")) return true;
    }

    if (this.nativeThemeSupport.hasClassTheming) {
      if (this.setClassTheme("dark")) return true;
    }

    if (this.nativeThemeSupport.hasCssVariables) {
      if (this.overrideCssVariables("dark")) return true;
    }

    return false;
  }

  activateNativeLightTheme() {
    if (this.nativeThemeSupport.hasDataAttributes) {
      if (this.setDataAttributeTheme("light")) return true;
    }

    if (this.nativeThemeSupport.hasClassTheming) {
      if (this.setClassTheme("light")) return true;
    }

    if (this.nativeThemeSupport.hasCssVariables) {
      if (this.overrideCssVariables("light")) return true;
    }

    return false;
  }

  setDataAttributeTheme(theme) {
    const patterns = [
      ["data-theme", theme],
      ["data-color-scheme", theme],
      ["data-mode", theme],
      ["data-color-mode", theme],
      ["data-bs-theme", theme],
    ];

    for (const [attr, value] of patterns) {
      if (document.documentElement.hasAttribute(attr)) {
        document.documentElement.setAttribute(attr, value);
        console.log(`Set ${attr}="${value}"`);
        return true;
      }
    }

    document.documentElement.setAttribute("data-theme", theme);
    console.log(`Set data-theme="${theme}"`);
    return true;
  }

  setClassTheme(theme) {
    const themeClasses = {
      dark: ["dark", "dark-mode", "theme-dark"],
      light: ["light", "light-mode", "theme-light"],
    };

    themeClasses[theme === "dark" ? "light" : "dark"].forEach((className) => {
      document.documentElement.classList.remove(className);
      document.body.classList.remove(className);
    });

    themeClasses[theme].forEach((className) => {
      document.documentElement.classList.add(className);
      document.body.classList.add(className);
    });

    console.log(` Applied ${theme} theme classes`);
    return true;
  }

  overrideCssVariables(theme) {
    try {
      const root = document.documentElement;
      const variables = this.getThemeVariables(theme);

      Object.entries(variables).forEach(([key, value]) => {
        root.style.setProperty(key, value);
      });

      console.log(`Overrode CSS variables for ${theme} theme`);
      return true;
    } catch (error) {
      console.error("Failed to override CSS variables:", error);
      return false;
    }
  }

  getThemeVariables(theme) {
    const darkVariables = {
      "--background-color": "#1a1a1a",
      "--bg-color": "#1a1a1a",
      "--color-bg": "#1a1a1a",
      "--text-color": "#ffffff",
      "--color-text": "#ffffff",
    };

    const lightVariables = {
      "--background-color": "#ffffff",
      "--bg-color": "#ffffff",
      "--color-bg": "#ffffff",
      "--text-color": "#333333",
      "--color-text": "#333333",
    };

    return theme === "dark" ? darkVariables : lightVariables;
  }

  applyFallbackDarkTheme() {
    document.body.style.backgroundColor = "#1a1a1a";
    document.body.style.color = "#e0e0e0";
    this.styleCommonElements("dark");
  }

  applyFallbackLightTheme() {
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#333333";
    this.styleCommonElements("light");
  }

  styleCommonElements(themeType) {
    const elements = document.querySelectorAll(
      "a, button, input, textarea, select"
    );

    elements.forEach((element) => {
      if (themeType === "dark") {
        element.style.backgroundColor = "#2d2d2d";
        element.style.color = "#ffffff";
        element.style.borderColor = "#555555";
      } else {
        element.style.backgroundColor = "#f8f9fa";
        element.style.color = "#333333";
        element.style.borderColor = "#dddddd";
      }
    });
  }

  resetToOriginal() {
    console.log("Restoring original styles...");
    this.removeNativeThemes();

    const originalBody = this.originalStyles.get("body");
    if (originalBody && originalBody.element) {
      originalBody.element.style.backgroundColor = originalBody.backgroundColor;
      originalBody.element.style.color = originalBody.color;
    }
    this.resetCommonElements();
    console.log("Original styles restored");
  }

  removeNativeThemes() {
    const dataAttrs = [
      "data-theme",
      "data-color-scheme",
      "data-mode",
      "data-color-mode",
      "data-bs-theme",
    ];
    dataAttrs.forEach((attr) => {
      document.documentElement.removeAttribute(attr);
    });

    const themeClasses = [
      "dark",
      "light",
      "dark-mode",
      "light-mode",
      "theme-dark",
      "theme-light",
    ];
    themeClasses.forEach((className) => {
      document.documentElement.classList.remove(className);
      document.body.classList.remove(className);
    });

    const allVariables = Object.keys(this.getThemeVariables("dark"));
    allVariables.forEach((key) => {
      document.documentElement.style.removeProperty(key);
    });
  }

  resetCommonElements() {
    const elements = document.querySelectorAll(
      "a, button, input, textarea, select"
    );
    elements.forEach((element) => {
      element.style.backgroundColor = "";
      element.style.color = "";
      element.style.borderColor = "";
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("Message received:", request);

      try {
        switch (request.action) {
          case "applyDarkTheme":
            this.applyAdaptiveDarkTheme();
            this.saveTheme("dark");
            break;
          case "applyLightTheme":
            this.applyAdaptiveLightTheme();
            this.saveTheme("light");
            break;
          case "resetTheme":
            this.resetToOriginal();
            this.saveTheme("reset");
            break;
          default:
            console.warn("Unknown action:", request.action);
        }

        if (sendResponse) {
          sendResponse({ success: true });
        }
      } catch (error) {
        console.error("Error handling message:", error);
        if (sendResponse) {
          sendResponse({ success: false, error: error.message });
        }
      }

      return true;
    });
  }

  saveTheme(themeName) {
    const siteKey = `theme_${this.currentSite}`;

    chrome.storage.local.set(
      {
        [siteKey]: themeName,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Storage error:", chrome.runtime.lastError);
        } else {
          console.log(`Saved theme: ${themeName} for ${this.currentSite}`);
        }
      }
    );
  }

  applySavedTheme() {
    const siteKey = `theme_${this.currentSite}`;

    chrome.storage.local.get([siteKey], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Storage read error:", chrome.runtime.lastError);
        return;
      }

      const savedTheme = result[siteKey];
      console.log("Loaded saved theme:", savedTheme);

      if (savedTheme === "dark") {
        this.applyAdaptiveDarkTheme();
      } else if (savedTheme === "light") {
        this.applyAdaptiveLightTheme();
      }
    });
  }
}

try {
  new AdvancedThemeEngine();
} catch (error) {
  console.error("Failed to initialize theme engine:", error);
}
