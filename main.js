// src/main.js
var { Plugin, PluginSettingTab, Setting } = require("obsidian");
var DEFAULT_SETTINGS = {
  // ── Font Families ──
  fontBody: "",
  fontHeading: "",
  fontInterface: "",
  fontMono: "",
  // ── Body Text ──
  bodySize: "",
  lineHeight: "",
  paragraphWeight: 0,
  // ── Headings (shared) ──
  headingColor: "",
  // ── Per-heading ──
  h1Size: "",
  h1Weight: 0,
  h1LineHeight: "",
  h1LetterSpacing: "",
  h2Size: "",
  h2Weight: 0,
  h2LineHeight: "",
  h3Size: "",
  h3Weight: 0,
  h3LineHeight: "",
  h4Size: "",
  h4Weight: 0,
  h5Size: "",
  h5Weight: 0,
  h6Size: "",
  h6Weight: 0,
  // ── Inline Title ──
  inlineTitleSize: "",
  inlineTitleWeight: 0,
  inlineTitleLineHeight: "",
  // ── Code ──
  codeSize: "",
  codeWeight: 0,
  // ── Emphasis ──
  boldColor: "",
  // ── UI Chrome ──
  uiSmallSize: "",
  uiSmallerSize: "",
  // ── Workspace ──
  defaultWorkspace: "",
  hideSidebarPanels: true,
  statusBarLocation: "main"
};
var WEIGHT_OPTIONS = [
  ["0", "Default"],
  ["100", "100 \xB7 Thin"],
  ["200", "200 \xB7 Extra Light"],
  ["300", "300 \xB7 Light"],
  ["350", "350"],
  ["400", "400 \xB7 Regular"],
  ["500", "500 \xB7 Medium"],
  ["600", "600 \xB7 Semibold"],
  ["700", "700 \xB7 Bold"],
  ["800", "800 \xB7 Extra Bold"],
  ["900", "900 \xB7 Black"]
];
function buildCSS(s) {
  const lines = [];
  const add = (name, val) => {
    if (val !== "" && val !== 0 && val !== void 0) lines.push(`  ${name}: ${val};`);
  };
  add("--font-text-theme", s.fontBody);
  add("--font-interface-theme", s.fontInterface);
  add("--font-monospace-theme", s.fontMono);
  if (s.fontHeading) {
    for (let i = 1; i <= 3; i++) add(`--h${i}-font`, s.fontHeading);
    add("--inline-title-font", s.fontHeading);
  }
  add("--font-text-size", s.bodySize);
  add("--line-height-normal", s.lineHeight);
  add("--paragraph-weight", s.paragraphWeight);
  if (s.headingColor) {
    for (let i = 1; i <= 6; i++) add(`--h${i}-color`, s.headingColor);
    add("--inline-title-color", s.headingColor);
  }
  for (let i = 1; i <= 6; i++) {
    add(`--h${i}-size`, s[`h${i}Size`]);
    add(`--h${i}-weight`, s[`h${i}Weight`]);
    if (i <= 3) add(`--h${i}-line-height`, s[`h${i}LineHeight`]);
  }
  add("--h1-letter-spacing", s.h1LetterSpacing);
  add("--inline-title-size", s.inlineTitleSize);
  add("--inline-title-weight", s.inlineTitleWeight);
  add("--inline-title-line-height", s.inlineTitleLineHeight);
  add("--code-size", s.codeSize);
  add("--code-weight", s.codeWeight);
  add("--bold-color", s.boldColor);
  add("--font-ui-small", s.uiSmallSize);
  add("--font-ui-smaller", s.uiSmallerSize);
  if (!lines.length) return "";
  return `body.theme-dark,
body.theme-light {
${lines.join("\n")}
}`;
}
var StatusBarTweak = class {
  constructor(location = "main") {
    this.location = location;
    this.observer = null;
    this.resizeObserver = null;
    this.rafId = null;
    this.host = null;
  }
  enable() {
    this.statusBar = document.querySelector(".status-bar");
    this.workspace = document.querySelector(".workspace");
    if (!this.statusBar || !this.workspace) return;
    this.originalParent = this.statusBar.parentNode;
    this.originalNextSibling = this.statusBar.nextSibling;
    this.update();
    this.observer = new MutationObserver(() => this.scheduleUpdate());
    this.observer.observe(this.workspace, {
      attributes: true,
      attributeFilter: ["style", "class"],
      childList: true,
      subtree: true
    });
    this.resizeObserver = new ResizeObserver(() => this.scheduleUpdate());
    const modRoot = document.querySelector(".workspace-split.mod-root");
    if (modRoot) this.resizeObserver.observe(modRoot);
    this.boundUpdate = () => this.scheduleUpdate();
    window.addEventListener("resize", this.boundUpdate);
  }
  disable() {
    this.restoreStatusBar();
    if (this.statusBar) {
      this.statusBar.style.removeProperty("left");
      this.statusBar.style.removeProperty("right");
      this.statusBar.style.removeProperty("width");
    }
    this.clearMainLayout();
    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
    if (this.boundUpdate) window.removeEventListener("resize", this.boundUpdate);
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.observer = null;
    this.resizeObserver = null;
    this.boundUpdate = null;
    this.rafId = null;
  }
  setLocation(location) {
    this.location = location === "right" ? "right" : "main";
    this.update();
  }
  scheduleUpdate() {
    if (this.rafId) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      this.update();
    });
  }
  update() {
    if (!this.statusBar) return;
    if (this.location === "right" && this.placeInRightSidebar()) {
      this.clearMainLayout();
      return;
    }
    this.restoreStatusBar();
    this.placeBelowMainWorkspace();
  }
  placeInRightSidebar() {
    const rightSplit = document.querySelector(".workspace-split.mod-right-split");
    if (!rightSplit) return false;
    if (!this.host || this.host.parentNode !== rightSplit) {
      this.host?.remove();
      this.host = document.createElement("div");
      this.host.className = "workspace-sidedock-vault-profile gib-tweaks-status-bar-host";
      rightSplit.appendChild(this.host);
    }
    if (this.statusBar.parentNode !== this.host) this.host.appendChild(this.statusBar);
    this.statusBar.classList.add("gib-tweaks-status-bar-in-sidebar");
    this.statusBar.style.removeProperty("left");
    this.statusBar.style.removeProperty("right");
    this.statusBar.style.removeProperty("width");
    return true;
  }
  restoreStatusBar() {
    if (!this.statusBar) return;
    if (this.statusBar.parentNode === this.host) {
      const targetParent = this.originalParent?.isConnected ? this.originalParent : document.querySelector(".app-container");
      const reference = this.originalNextSibling?.parentNode === targetParent ? this.originalNextSibling : null;
      if (targetParent) {
        targetParent.insertBefore(this.statusBar, reference);
        this.originalParent = targetParent;
      }
    }
    this.statusBar.classList.remove("gib-tweaks-status-bar-in-sidebar");
    if (this.statusBar.parentNode !== this.host) {
      this.host?.remove();
      this.host = null;
    }
  }
  placeBelowMainWorkspace() {
    const modRoot = document.querySelector(".workspace-split.mod-root");
    if (!modRoot) return;
    const rect = modRoot.getBoundingClientRect();
    this.statusBar.style.left = rect.left + "px";
    this.statusBar.style.width = rect.width + "px";
    this.statusBar.style.right = "auto";
    const barHeight = this.statusBar.getBoundingClientRect().height;
    modRoot.style.paddingBottom = barHeight + "px";
    this.mainRoot = modRoot;
  }
  clearMainLayout() {
    this.mainRoot?.style.removeProperty("padding-bottom");
    this.mainRoot = null;
  }
};
function createSettingGroup(parent, heading, description) {
  const group = parent.createDiv({ cls: "setting-group" });
  const headerEl = group.createDiv({ cls: "setting-item setting-item-heading" });
  const infoEl = headerEl.createDiv({ cls: "setting-item-info" });
  infoEl.createDiv({ cls: "setting-item-name", text: heading });
  if (description) {
    infoEl.createDiv({ cls: "setting-item-description", text: description });
  }
  return group.createDiv({ cls: "setting-items" });
}
function addTextSetting(container, plugin, name, key, desc, placeholder) {
  new Setting(container).setName(name).setDesc(desc || "").addText(
    (text) => text.setPlaceholder(placeholder || "").setValue(plugin.settings[key]).onChange(async (value) => {
      plugin.settings[key] = value.trim();
      await plugin.saveSettings();
    })
  );
}
function addWeightSetting(container, plugin, name, key, desc) {
  new Setting(container).setName(name).setDesc(desc || "").addDropdown((drop) => {
    for (const [value, label] of WEIGHT_OPTIONS) {
      drop.addOption(value, label);
    }
    drop.setValue(String(plugin.settings[key]));
    drop.onChange(async (value) => {
      plugin.settings[key] = parseInt(value);
      await plugin.saveSettings();
    });
  });
}
var TypographySettingTab = class extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    const p = this.plugin;
    containerEl.empty();
    new Setting(containerEl).setDesc("Empty fields inherit from Gib Theme or Obsidian defaults.").addButton(
      (btn) => btn.setButtonText("Reset all to defaults").setWarning().onClick(async () => {
        p.settings = Object.assign({}, DEFAULT_SETTINGS);
        await p.saveSettings();
        this.display();
      })
    );
    {
      const items = createSettingGroup(
        containerEl,
        "Font families",
        "CSS font stacks applied globally. Affects notes, sidebars, and plugins."
      );
      addTextSetting(
        items,
        p,
        "Body text",
        "fontBody",
        "Paragraphs, list items, body text in notes and chat",
        '"Segoe UI Variable", sans-serif'
      );
      addTextSetting(
        items,
        p,
        "Headings",
        "fontHeading",
        "H1\u2013H3 and inline title (serif by default)",
        '"Libre Baskerville", serif'
      );
      addTextSetting(
        items,
        p,
        "Interface",
        "fontInterface",
        "Sidebar, tabs, menus, settings, toolbar labels",
        '"Segoe UI Variable", sans-serif'
      );
      addTextSetting(
        items,
        p,
        "Monospace",
        "fontMono",
        "Code blocks, inline code, tool call names, terminal output",
        '"Cascadia Code", monospace'
      );
    }
    {
      const items = createSettingGroup(
        containerEl,
        "Body text",
        "Base text properties for paragraphs and reading view."
      );
      addTextSetting(
        items,
        p,
        "Font size",
        "bodySize",
        "Base size for note and chat body text",
        "16px"
      );
      addTextSetting(
        items,
        p,
        "Line height",
        "lineHeight",
        "Spacing between lines",
        "1.5"
      );
      addWeightSetting(
        items,
        p,
        "Paragraph weight",
        "paragraphWeight",
        "Weight for paragraphs and list items"
      );
    }
    {
      const items = createSettingGroup(
        containerEl,
        "Heading color",
        "Shared color across all heading levels, inline title, and chat headings."
      );
      addTextSetting(items, p, "Color", "headingColor", "", "#D4C5B5");
    }
    const levels = [
      { l: 1, desc: "Document title", size: "2em", lh: "1.0", ls: "-0.015em" },
      { l: 2, desc: "Major section", size: "1.7em", lh: "1.2" },
      { l: 3, desc: "Subsection", size: "1.6em", lh: "1.4" },
      { l: 4, desc: "Minor heading", size: "1.3em" },
      { l: 5, desc: "Small heading", size: "1.05em" },
      { l: 6, desc: "Smallest heading", size: "1em" }
    ];
    for (const h of levels) {
      const items = createSettingGroup(containerEl, `Heading ${h.l}`, h.desc);
      addTextSetting(items, p, "Size", `h${h.l}Size`, "", h.size);
      addWeightSetting(items, p, "Weight", `h${h.l}Weight`, "");
      if (h.lh) addTextSetting(items, p, "Line height", `h${h.l}LineHeight`, "", h.lh);
      if (h.ls) addTextSetting(items, p, "Letter spacing", `h${h.l}LetterSpacing`, "", h.ls);
    }
    {
      const items = createSettingGroup(
        containerEl,
        "Inline title",
        'The large title shown at the top of notes when "Show inline title" is enabled.'
      );
      addTextSetting(items, p, "Size", "inlineTitleSize", "", "2em");
      addWeightSetting(items, p, "Weight", "inlineTitleWeight", "");
      addTextSetting(items, p, "Line height", "inlineTitleLineHeight", "", "1.0");
    }
    {
      const items = createSettingGroup(
        containerEl,
        "Code",
        "Code blocks, inline code, and terminal output across notes and Better Claude."
      );
      addTextSetting(
        items,
        p,
        "Font size",
        "codeSize",
        "Size for code blocks and inline code",
        ""
      );
      addWeightSetting(
        items,
        p,
        "Weight",
        "codeWeight",
        "Font weight for all code and monospace text"
      );
    }
    {
      const items = createSettingGroup(
        containerEl,
        "Emphasis",
        "Bold text styling in notes and chat."
      );
      addTextSetting(items, p, "Bold color", "boldColor", "", "#D4C5B5");
    }
    {
      const items = createSettingGroup(
        containerEl,
        "Workspace",
        "Control workspace behavior on startup."
      );
      const workspaces = this.app.internalPlugins?.getPluginById?.("workspaces")?.instance;
      const names = workspaces ? Object.keys(workspaces.workspaces || {}) : [];
      new Setting(items).setName("Default workspace").setDesc(names.length ? "Loaded automatically when Obsidian starts." : "Enable the core Workspaces plugin and save a workspace first.").addDropdown((drop) => {
        drop.addOption("", "None");
        for (const name of names) {
          drop.addOption(name, name);
        }
        drop.setValue(p.settings.defaultWorkspace);
        drop.onChange(async (value) => {
          p.settings.defaultWorkspace = value;
          await p.saveSettings();
        });
      });
      new Setting(items).setName("Hide sidebar panels on startup").setDesc("Closes Backlinks, Outgoing links, Tags, and Properties panels that Obsidian re-opens on every reload.").addToggle((toggle) => {
        toggle.setValue(p.settings.hideSidebarPanels);
        toggle.onChange(async (value) => {
          p.settings.hideSidebarPanels = value;
          await p.saveSettings();
        });
      });
      new Setting(items).setName("Status bar location").setDesc("Keep the status bar below the main workspace or place it in a footer at the bottom of the right sidebar.").addDropdown((drop) => {
        drop.addOption("main", "Main workspace footer");
        drop.addOption("right", "Right sidebar footer");
        drop.setValue(p.settings.statusBarLocation);
        drop.onChange(async (value) => {
          p.settings.statusBarLocation = value;
          await p.saveSettings();
        });
      });
    }
    {
      const items = createSettingGroup(
        containerEl,
        "UI chrome",
        "Obsidian interface text: sidebar labels, tab titles, menus, settings, toolbar buttons."
      );
      addTextSetting(
        items,
        p,
        "UI small text",
        "uiSmallSize",
        "Primary UI text (sidebar items, menu items, setting labels)",
        "13px"
      );
      addTextSetting(
        items,
        p,
        "UI smaller text",
        "uiSmallerSize",
        "Secondary UI text (badges, status indicators, footnotes)",
        "11px"
      );
    }
  }
};
module.exports = class GibTweaksPlugin extends Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new TypographySettingTab(this.app, this));
    this.styleEl = document.createElement("style");
    this.styleEl.id = "gib-tweaks-typography";
    document.head.appendChild(this.styleEl);
    this.applyTypography();
    this.app.workspace.onLayoutReady(() => {
      if (this.settings.defaultWorkspace) {
        const workspaces = this.app.internalPlugins?.getPluginById?.("workspaces")?.instance;
        if (workspaces && workspaces.workspaces?.[this.settings.defaultWorkspace]) {
          workspaces.loadWorkspace(this.settings.defaultWorkspace);
        }
      }
      if (this.settings.hideSidebarPanels) {
        const unwanted = ["backlink", "outgoing-link", "tag", "all-properties"];
        for (const type of unwanted) {
          for (const leaf of this.app.workspace.getLeavesOfType(type)) {
            leaf.detach();
          }
        }
      }
      setTimeout(() => {
        this.statusBarTweak = new StatusBarTweak(this.settings.statusBarLocation);
        this.statusBarTweak.enable();
      }, 100);
    });
  }
  onunload() {
    this.statusBarTweak?.disable();
    this.styleEl?.remove();
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.applyTypography();
    this.statusBarTweak?.setLocation(this.settings.statusBarLocation);
  }
  applyTypography() {
    this.styleEl.textContent = buildCSS(this.settings);
  }
};
