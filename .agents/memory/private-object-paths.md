---
name: Private object paths
description: How signed App Storage uploads map to persistent private media paths and cleanup.
---

Browser-facing `/objects/` paths must be relative to `PRIVATE_OBJECT_DIR`, even though the signed upload target includes the full private prefix. Never return the full prefixed object name and then prepend the private directory again during lookup.

**Why:** A full object name can pass the signed PUT but fail registration because lookup duplicates the private prefix. Also, deleting only the database media row leaves the uploaded bytes behind.

**How to apply:** Keep request-url and lookup path conversion inverse to each other. When deleting unattached media, remove the stored object before deleting its database record; tolerate an already-missing object so stale rows remain cleanable.