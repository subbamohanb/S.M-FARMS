# S.M FARMS ownership and access

The S.M FARMS web application is maintained in the shared Manus project `sm-farms-store`. The current project owner can manage the live site, checkpoints, domains, secrets, database, and integrations through the Manus Management UI. The latest saved application checkpoint is version `0506a6db`.

The canonical Expo/Android workspace is the `mobile/` directory in this repository. It contains `package.json`, `app.config.ts`, `eas.json`, and the Android EAS build profiles. Android builds must be started from that directory, not from an extracted parent folder.

Payment credentials are configured only through the project secrets system. The latest Razorpay Live credential validation returned HTTP 401, so the storefront deliberately remains in its non-charging fallback mode. No payment secret is stored in this document or exposed to the browser.
