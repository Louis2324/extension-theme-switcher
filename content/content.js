class ThemeManager {
  constructor() {
    this.currentSite = window.location.hostname;
    this.init();
  }

  init() {
    console.log(`🎨 Theme Switcher loaded on: ${this.currentSite}`);
    this.applySavedTheme();
    this.setupMessageListener();
  }

  setupMessageListener() {
    // Listen for theme commands from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log("📨 Theme command received:", request);

      switch (request.action) {
        case "applyDarkTheme":
          this.applyDarkTheme();
          break;
        case "applyLightTheme":
          this.applyLightTheme();
          break;
        case "resetTheme":
          this.resetTheme();
          break;
      }

      this.saveTheme(
        request.action.replace("apply", "").replace("Theme", "").toLowerCase()
      );
    });
  }

  applyDarkTheme() {
    console.log("Applying adaptive dark theme...");

    const originalBg = this.getComputedColor(document.body, "backgroundColor");
    const originalText = this.getComputedColor(document.body, "color");

    const darkBg = this.calculateDarkBackground(originalBg);
    const lightText = this.calculateLightText(originalText);

    document.body.style.backgroundColor = darkBg;
    document.body.style.color = lightText;

    this.styleInteractiveElements(darkBg, lightText);

    this.adjustMediaForDarkMode();
  }

  applyLightTheme() {
    console.log("Applying enhanced light theme...");

    document.body.style.backgroundColor = "#f8f9fa";
    document.body.style.color = "#2c3e50";

    this.styleInteractiveElements("#ffffff", "#2c3e50");

    this.resetMediaStyles();
  }

  resetTheme() {
    console.log("Resetting to website defaults...");

    document.body.style.backgroundColor = "";
    document.body.style.color = "";

    this.resetAllElements();
  }

  calculateDarkBackground(originalColor) {
    const hsl = this.rgbToHsl(originalColor);
    const darkHsl = [
      hsl[0],
      Math.max(hsl[1] * 0.7, 0.1), 
      Math.max(hsl[2] * 0.2, 0.05),
    ];

    return this.hslToRgb(darkHsl);
  }

  calculateLightText(originalColor) {
    const hsl = this.rgbToHsl(originalColor);
    const textHsl = [
      hsl[0],
      Math.min(hsl[1] * 0.5, 0.3),
      0.9,
    ];

    return this.hslToRgb(textHsl);
  }

  styleInteractiveElements(bgColor, textColor) {
    const selectors = 'a, button, input, textarea, select, [role="button"]';
    const elements = document.querySelectorAll(selectors);

    elements.forEach((el) => {
      const currentBg = this.getComputedColor(el, "backgroundColor");
      if (this.isDefaultColor(currentBg)) {
        el.style.backgroundColor = bgColor;
        el.style.color = textColor;
        el.style.borderColor = this.adjustColorBrightness(bgColor, -20);
      }
    });
  }

  adjustMediaForDarkMode() {
    document.querySelectorAll("img, video").forEach((media) => {
      media.style.filter = "brightness(0.85) contrast(1.1)";
    });
  }

  resetMediaStyles() {
    document.querySelectorAll("img, video").forEach((media) => {
      media.style.filter = "";
    });
  }

  resetAllElements() {
    const elements = document.querySelectorAll("*");
    elements.forEach((el) => {
      if (el.hasAttribute("data-theme-applied")) {
        el.removeAttribute("data-theme-applied");
        el.style.backgroundColor = "";
        el.style.color = "";
        el.style.borderColor = "";
      }
    });
  }


  saveTheme(themeName) {
    const siteKey = `theme_${this.currentSite}`;
    chrome.storage.local.set({ [siteKey]: themeName }, () => {
      console.log(`Saved ${themeName} theme for ${this.currentSite}`);
    });
  }

  applySavedTheme() {
    const siteKey = `theme_${this.currentSite}`;
    chrome.storage.local.get([siteKey], (result) => {
      const savedTheme = result[siteKey];
      if (savedTheme) {
        console.log(`Applying saved theme: ${savedTheme}`);
        this[
          `apply${
            savedTheme.charAt(0).toUpperCase() + savedTheme.slice(1)
          }Theme`
        ]();
      }
    });
  }

  getComputedColor(element, property) {
    return getComputedStyle(element)[property];
  }

  rgbToHsl(rgb) {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return [0, 0, 0.5];

    const r = parseInt(match[1]) / 255;
    const g = parseInt(match[2]) / 255;
    const b = parseInt(match[3]) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [h, s, l];
  }

  hslToRgb(hsl) {
    const [h, s, l] = hsl;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(
      b * 255
    )})`;
  }

  isDefaultColor(color) {
    const defaults = ["rgba(0, 0, 0, 0)", "transparent", "rgb(255, 255, 255)"];
    return defaults.includes(color) || color === "";
  }

  adjustColorBrightness(color, percent) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return color;

    const factor = 1 + percent / 100;
    const r = Math.min(255, Math.max(0, parseInt(match[1]) * factor));
    const g = Math.min(255, Math.max(0, parseInt(match[2]) * factor));
    const b = Math.min(255, Math.max(0, parseInt(match[3]) * factor));

    return `rgb(${r}, ${g}, ${b})`;
  }
}

new ThemeManager();
