# Gib Tweaks

Gib Tweaks is a desktop companion plugin for Gib Theme. It provides typography overrides that CSS settings cannot conveniently express and a small set of workspace behaviors.

## Features

- Configure body, heading, interface, and monospace font families.
- Adjust body text, heading, inline-title, code, emphasis, and UI typography.
- Load a selected Obsidian workspace at startup.
- Optionally close sidebar panels that Obsidian restores during startup.
- Keep the status bar aligned with the central workspace when sidebars change size, or place it in a full-width footer at the bottom of the right sidebar that matches the left vault and settings footer height.
- Coordinate status-bar placement with Gib Theme so its main-workspace rules do not leak into the right-sidebar footer.

Empty typography fields inherit from the active theme or Obsidian defaults. The plugin is designed for [Gib Theme](https://github.com/Giblicious/Gib-Theme) but does not install the theme itself.

## Install with BRAT

1. Install and enable **BRAT** in Obsidian.
2. Open BRAT settings and choose **Add Beta Plugin**.
3. Enter `Giblicious/Gib-Tweaks`.
4. Enable **Gib Tweaks** under Community plugins.

Gib Tweaks is desktop-only because its workspace and status-bar behavior depends on desktop layout APIs.

## Development

```sh
npm ci
npm run build
npm run check
```

Source lives under `src/`. The build produces BRAT's required root-level `main.js`; `manifest.json` and `styles.css` are also kept at the repository root. Do not develop in or copy builds directly into a real vault installation.

## Release

1. Update the version in `package.json`, `manifest.json`, and `versions.json`.
2. Update `CHANGELOG.md`.
3. Run `npm run check` and commit the generated `main.js`.
4. Push the tested commit and create a numeric version tag matching the manifest, such as `0.1.0`.
5. GitHub Actions publishes the BRAT release assets. BRAT remains responsible for installing or updating the plugin in Obsidian.

## License

MIT
