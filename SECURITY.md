# Security

Please report security issues privately through GitHub's security advisory form for this repository. Do not open a public issue for an unpatched vulnerability.

Gib Tweaks stores its settings in Obsidian's plugin data file. It does not require accounts, credentials, telemetry, or network access. The plugin changes CSS variables and uses Obsidian workspace APIs on the local desktop device.

Runtime `data.json` files belong to the user's vault installation and must not be committed, copied into releases, or overwritten during development or publishing.
