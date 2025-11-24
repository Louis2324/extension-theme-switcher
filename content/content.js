class AdvancedThemeEngine {
  constructor() {
    this.currentSite = window.location.hostname;
    this.originalStyles = new Map();
    this.observedElements = new Set();
    this.init();
  }

  init() {
    console.log(`🎨 Advanced Theme Engine loaded on: ${this.currentSite}`);

    // Store original state immediately
    this.storeOriginalState();

    // Set up message listener
    this.setupMessageListener();

    // Apply saved theme
    this.applySavedTheme();
  }

  // Simplified: Store original body state only for now
  storeOriginalState() {
    console.log("💾 Storing original website state...");

    // Store body styles
    const bodyStyle = getComputedStyle(document.body);
    this.originalStyles.set("body", {
      backgroundColor: bodyStyle.backgroundColor,
      color: bodyStyle.color,
      element: document.body,
    });

    console.log("✅ Original state stored");
  }

  // FIXED: Working dark theme
  applyAdaptiveDarkTheme() {
    console.log("🌙 Applying adaptive dark theme...");

    // Simple dark theme that works
    document.body.style.backgroundColor = "#1a1a1a";
    document.body.style.color = "#e0e0e0";

    // Style common elements
    this.styleCommonElements("dark");

    // Mark as modified
    this.markModifiedElements();

    console.log("✅ Dark theme applied");
  }

  // FIXED: Working light theme
  applyAdaptiveLightTheme() {
    console.log("☀️ Applying adaptive light theme...");

    // Clean light theme
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#333333";

    // Style common elements
    this.styleCommonElements("light");

    // Mark as modified
    this.markModifiedElements();

    console.log("✅ Light theme applied");
  }

  // Style common interactive elements
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

  // FIXED: Proper reset that works
  resetToOriginal() {
    console.log("🔄 Restoring original styles...");

    // Restore body styles
    const originalBody = this.originalStyles.get("body");
    if (originalBody && originalBody.element) {
      originalBody.element.style.backgroundColor = originalBody.backgroundColor;
      originalBody.element.style.color = originalBody.color;
    }

    // Reset common elements
    this.resetCommonElements();

    console.log("✅ Original styles restored");
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

  markModifiedElements() {
    document.body.setAttribute("data-theme-modified", "true");
  }

  // FIXED: Message listener with error handling
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("📨 Message received:", request);

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

        // Send response back if needed
        if (sendResponse) {
          sendResponse({ success: true });
        }
      } catch (error) {
        console.error("Error handling message:", error);
        if (sendResponse) {
          sendResponse({ success: false, error: error.message });
        }
      }

      return true; // Keep message channel open for async response
    });
  }

  // FIXED: Save theme with proper error handling
  saveTheme(themeName) {
    const siteKey = `theme_${this.currentSite}`;

    chrome.storage.local.set(
      {
        [siteKey]: themeName,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("❌ Storage error:", chrome.runtime.lastError);
        } else {
          console.log(`✅ Saved theme: ${themeName} for ${this.currentSite}`);
        }
      }
    );
  }

  // FIXED: Apply saved theme
  applySavedTheme() {
    const siteKey = `theme_${this.currentSite}`;

    chrome.storage.local.get([siteKey], (result) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Storage read error:", chrome.runtime.lastError);
        return;
      }

      const savedTheme = result[siteKey];
      console.log("📖 Loaded saved theme:", savedTheme);

      if (savedTheme === "dark") {
        this.applyAdaptiveDarkTheme();
      } else if (savedTheme === "light") {
        this.applyAdaptiveLightTheme();
      }
      // If 'reset' or undefined, do nothing
    });
  }

  // FIXED: Basic color utilities that work
  isColorDark(color) {
    // Simple check for dark colors
    const rgb = this.parseColor(color);
    const luminance = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114) / 255;
    return luminance < 0.5;
  }

  parseColor(color) {
    if (!color || color === "rgba(0, 0, 0, 0)" || color === "transparent") {
      return [255, 255, 255]; // Default to white for transparent
    }

    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    }
    return [255, 255, 255]; // Default to white
  }
}

// FIXED: Initialize with error handling
try {
  new AdvancedThemeEngine();
} catch (error) {
  console.error("❌ Failed to initialize theme engine:", error);
}
