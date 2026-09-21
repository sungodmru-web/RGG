---
name: Clerk and React compatibility
description: Why the RGG website overrides the workspace React patch when using current Clerk.
---

Keep the RGG website on a Clerk-compatible React patch without changing the workspace catalog’s Expo-pinned React version.

**Why:** Current Clerk React and its shared runtime reject React 19.1.0, while the shared catalog explicitly preserves that exact version for Expo compatibility. A website-only React 19.1.4 override satisfies Clerk without affecting other artifacts.

**How to apply:** When changing Clerk or React dependencies, verify peer ranges for the website separately and do not “fix” the mismatch by changing the shared Expo pin.