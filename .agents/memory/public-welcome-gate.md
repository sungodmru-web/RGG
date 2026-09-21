---
name: Public welcome gate
description: Records the intentional fresh-load behavior of the bilingual cinematic entry gate.
---

Every fresh load of a public route must show the English/French welcome gate, even when a language preference is already stored. Internal client-side navigation must not replay the gate. Administrator and authentication routes remain excluded.

**Why:** This is an explicit product requirement and can look like a deep-link or persistence defect during generic browser audits.

**How to apply:** Preserve this distinction in navigation changes, tests, performance work, and audits. Treat stored language as the suggested/default choice, not as permission to skip the gate.