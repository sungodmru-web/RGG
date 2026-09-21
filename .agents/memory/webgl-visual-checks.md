---
name: WebGL visual checks
description: Environment constraint for reliable browser screenshots of the 3D book.
---

Run WebGL visual regression checks in the dedicated Playwright Chromium configuration with SwiftShader enabled. Do not use the static app-preview screenshot service as evidence that the 3D renderer works. Keep iOS WebKit checks in a separate command for a compatible CI or device-farm host.

**Why:** The app-preview screenshot browser can report WebGL as unavailable even when the dedicated Chromium visual suite renders the same scene correctly. Chromium also needs its native Nix graphics libraries available. The standard Replit Linux image lacks the native GTK, GStreamer, ICU, and graphics libraries required by Playwright's bundled WebKit.

**How to apply:** For book artwork or other WebGL regression work, rely on the named GPU visual validation and its committed references. Keep browser installation inside the validation command so clean checkouts are reproducible. Use app-preview screenshots only for non-WebGL page layout checks. Run the iOS Safari project on infrastructure that supports Playwright WebKit or a real-device provider rather than weakening it to Chromium emulation.