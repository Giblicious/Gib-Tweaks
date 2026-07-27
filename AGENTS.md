# Claudish Tweaks agent policy

These instructions apply to every automated or AI-assisted change in this repository.

## Obsidian plugin deployment

- Claudish Tweaks installations managed by BRAT must be installed and updated only through BRAT from the public GitHub release.
- Never copy, replace, patch, or delete `main.js`, `manifest.json`, `styles.css`, `versions.json`, or any other plugin artifact inside a user's Obsidian vault.
- Never treat a successful local build as permission to deploy its output into a real vault.
- Publishing a plugin version ends after the tested commit, tag, GitHub release, and release assets are available. Report that BRAT can now update; do not perform BRAT's client-side installation step on the user's behalf.
- If BRAT cannot update or a release artifact is unavailable, stop and report the problem. Do not fall back to a manual installation.
- A manual install is allowed only when the user explicitly requests a manual install in that same turn and confirms the exact target vault.
- Do not restart Obsidian, reload the app, or toggle plugins without explicit permission in the current turn.

## User-owned runtime state

- Every real vault and its `.obsidian` directory are user-owned runtime state, not deployment targets or working directories.
- Treat installed `data.json` as read-only diagnostic input unless the user explicitly requests a settings change. Never overwrite, recreate, copy, or normalize it during deployment.
- Never print, commit, log, or expose personal paths or values read from runtime settings.
- Test installation behavior only in disposable test vaults created specifically for testing, never in a user's real vault.

## Release boundary

- Build and test, commit intentionally, push, create the numeric version tag, wait for CI and release success, and verify the public release assets.
- Before publishing, ensure `package.json`, `manifest.json`, `versions.json`, and `CHANGELOG.md` agree on the release version.
- A release must provide root-level `main.js`, `manifest.json`, and `styles.css` assets for BRAT.
- Client installation remains BRAT's responsibility.

## Required handoff

- State exactly what was published and where.
- When a BRAT update is required, say that the release is ready for BRAT and leave the installed vault untouched.
- Never claim the client plugin is updated merely because release files were built or published.
