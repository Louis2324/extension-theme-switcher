class PopupManager {
  constructor() {
    this.currentTab = null;
    this.currentSite = null;
    this.init();
  }

  async init() {
    console.log("🔧 Popup initialized");
    await this.getCurrentTab();
    this.setupEventListeners();
    this.loadCurrentTheme();
    this.updateSiteInfo();
  }

  // Get the currently active tab
  async getCurrentTab() {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        this.currentTab = tabs[0];
        this.currentSite = new URL(this.currentTab.url).hostname;
        resolve(tabs[0]);
      });
    });
  }

  // Update UI with current website info
  updateSiteInfo() {
    const siteInfo = document.getElementById("siteInfo");
    if (siteInfo && this.currentSite) {
      siteInfo.textContent = this.currentSite;
    }
  }

  setupEventListeners() {
    const darkBtn = document.getElementById("darkBtn");
    const lightBtn = document.getElementById("lightBtn");
    const resetBtn = document.getElementById("resetBtn");

    darkBtn.addEventListener("click", () => this.applyTheme("applyDarkTheme"));
    lightBtn.addEventListener("click", () =>
      this.applyTheme("applyLightTheme")
    );
    resetBtn.addEventListener("click", () => this.applyTheme("resetTheme"));
  }

  // Send theme command to content script
  async applyTheme(action) {
    try {
      if (!this.currentTab) {
        await this.getCurrentTab();
      }

      // Send message to content script
      chrome.tabs.sendMessage(this.currentTab.id, { action }, (response) => {
        if (chrome.runtime.lastError) {
          this.showStatus(
            "Error: Could not apply theme. Please refresh the page.",
            "error"
          );
        } else {
          this.showStatus(`Theme applied successfully!`, "success");
          this.updateButtonStates(action);
        }
      });
    } catch (error) {
      console.error("Error applying theme:", error);
      this.showStatus("Error applying theme. Please try again.", "error");
    }
  }

  // Update button visual states
  updateButtonStates(action) {
    const buttons = {
      applyDarkTheme: "darkBtn",
      applyLightTheme: "lightBtn",
      resetTheme: "resetBtn",
    };

    // Remove active class from all buttons
    document.querySelectorAll(".theme-btn").forEach((btn) => {
      btn.classList.remove("active");
    });

    // Add active class to clicked button
    const activeBtn = document.getElementById(buttons[action]);
    if (activeBtn) {
      activeBtn.classList.add("active");
    }
  }

  // Load and display current theme for this site
  async loadCurrentTheme() {
    try {
      const siteKey = `theme_${this.currentSite}`;
      chrome.storage.local.get([siteKey], (result) => {
        const currentTheme = result[siteKey];
        if (currentTheme) {
          const actionMap = {
            dark: "applyDarkTheme",
            light: "applyLightTheme",
            reset: "resetTheme",
          };
          this.updateButtonStates(actionMap[currentTheme]);
        }
      });
    } catch (error) {
      console.error("Error loading current theme:", error);
    }
  }

  // Show status message to user
  showStatus(message, type = "success") {
    const status = document.getElementById("status");
    status.textContent = message;
    status.className = `status show ${type}`;

    setTimeout(() => {
      status.classList.remove("show");
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new PopupManager();
});
