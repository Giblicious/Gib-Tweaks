# Changelog

## 0.4.3

- Makes the native status bar itself a direct, full-width footer child of the right sidebar.
- Removes the nested wrapper that could leave the native bar visually floating over the workspace.
- Defaults newly enabled installations to the right-sidebar footer location.

## 0.4.2

- Makes the relocated status bar a true full-width child footer of the right sidebar.
- Matches the footer's live height to Obsidian's left vault and settings footer.
- Overrides Obsidian's zero-height horizontal split rule and follows sidebar layout changes.

## 0.4.1

- Isolates right-sidebar status styling from Gib Theme's main-workspace status rule.
- Raises the sidebar footer above Gib Theme's decorative sidebar shadow layer.
- Defines complete footer spacing, alignment, borders, and overflow behavior without relying on theme load order.

## 0.4.0

- Adds a live status-bar location setting with main-workspace and right-sidebar footer options.
- Styles the right-sidebar footer to match Obsidian's left vault and settings footer.
- Restores the status bar to its original DOM position when switching back or unloading the plugin.

## 0.3.0

- Updates the companion theme name and repository references from Claudish to Gib Theme.
- Updates the settings description to use the new theme name.

## 0.2.0

- Renames the plugin and public project from Claudish Tweaks to Gib Tweaks.
- Changes the plugin ID to `gib-tweaks` and the BRAT repository path to `Giblicious/Gib-Tweaks`.

## 0.1.0

- Adds theme-aware controls for font families, sizes, weights, line heights, heading color, bold color, and interface text.
- Adds optional default-workspace loading and startup sidebar cleanup.
- Keeps the status bar aligned with the central workspace as desktop sidebars resize.
- Establishes a standalone BRAT repository with reproducible build, validation, CI, and tagged release automation.
