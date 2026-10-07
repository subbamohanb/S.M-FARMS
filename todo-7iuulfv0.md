# Project TODO

- [x] Open the attached S.M FARMS web project for editing
- [x] Verify the current public preview link loads over HTTPS
- [x] Review the current project state for obvious public-access or security blockers
- [x] Create a checkpoint so the project can be published from the Management UI
- [x] Deliver the verified public preview link and publishing next step

- [ ] Determine whether the current S.M FARMS project contains an Expo mobile app suitable for EAS
- [ ] Configure or validate eas.json and app configuration for an Android preview APK
- [ ] Authenticate with Expo and initialize the EAS project if required
- [ ] Run the EAS Android preview build and obtain the APK link
- [ ] Verify and deliver the APK link, or clearly report the exact user authentication step still required

- [x] Check the workspace for existing Expo and EAS configuration files
- [x] Create a separate Expo mobile app configuration for S.M FARMS
- [x] Add an Android preview EAS build profile and app configuration
- [x] Validate the Expo configuration and package scripts
- [x] Document the exact EAS login, initialization, and APK build steps

- [x] Recheck the current Expo CLI login status
- [x] Review and validate app.json/app.config.ts and eas.json for Android preview
- [x] Retry the Android preview EAS build and capture its result
- [x] Document the local Android APK build path without Expo EAS

- [x] Inspect the mobile Android build workspace and existing signing configuration
- [x] Generate a local Android release keystore with protected credentials
- [x] Configure Gradle signing through uncommitted local properties
- [x] Validate keystore metadata and the local release build configuration
- [x] Document keystore backup, rotation, and security requirements

- [ ] Successfully run a Gradle signing validation step and confirm the release variant uses the generated keystore
- [x] Add explicit keystore rotation guidance and explain update-compatibility consequences

- [ ] Inspect the current Razorpay checkout implementation and recent payment errors
- [ ] Determine the payment failure root cause without exposing secrets
- [ ] Apply a focused payment-flow fix and add or update tests
- [ ] Verify checkout behavior and document any required Razorpay credential action

- [x] Inspect the latest checkout UI, router, schema, and transaction flow
- [x] Add Cash on Delivery as a selectable payment method
- [x] Persist COD orders with an appropriate pending cash-payment status
- [x] Add or update tests for COD checkout and preserve online payment behavior
- [x] Verify the COD flow in the preview and checkpoint the update

- [x] Add a router test for orders.checkout with paymentMethod cod and no Razorpay dependency
- [x] Add a UI test covering the payment-method selector and COD path
- [x] Interactively verify COD checkout in the preview with a cart and success state
- [x] Save a new checkpoint after the verified COD flow

- [x] Add and run a real browser integration test that selects Cash on Delivery and submits checkout
- [x] Save a new checkpoint after the verified COD flow changes
