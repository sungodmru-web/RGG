---
name: Enquiry delivery durability
description: Durable ordering and status rules for public enquiry intake and owner notifications.
---

Persist a validated enquiry before attempting any owner notification. Delivery state and administrator review state are separate concerns and must remain independently visible.

**Why:** A mail-provider outage must not lose a website message, and a successfully delivered notification does not mean the team has reviewed or resolved the enquiry.

**How to apply:** For any enquiry delivery or retry change, keep the database record authoritative, update only delivery fields from provider outcomes, and keep review transitions explicit and administrator-controlled.