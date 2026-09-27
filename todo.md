# Persistent S.M FARMS data update

- [x] Upgrade the static project to the full-stack database-enabled template.
- [x] Define a products table for Agri Farm and Dairy Farm inventory.
- [x] Generate and apply the database migration without destructive operations.
- [x] Add database helpers and typed public product procedures.
- [x] Connect the Agri Farm and Dairy Farm pages to persisted product records.
- [x] Verify products load from the database and save a new checkpoint.

# Razorpay and UPI integration plan

- [x] Confirm Razorpay Checkout, UPI, order creation, signature verification, and webhook requirements.
- [x] Define secure environment variables and server-only credential handling.
- [x] Map the payment flow to S.M FARMS cart, orders, and persistent database records.
- [x] Document implementation steps, testing requirements, and production launch checklist.

# Razorpay order creation implementation

- [x] Add persistent orders and orderItems tables with pending, paid, failed, and cancelled states.
- [x] Generate and apply the order schema migration safely.
- [x] Request server-only Razorpay test credentials.
- [x] Add a server-side Razorpay Orders API helper and typed tRPC procedure.
- [x] Connect Agri Farm and Dairy Farm checkout buttons to create pending orders.
- [x] Add Vitest coverage and verify the checkout order flow without charging a customer.
- [x] Save a new payment-ready checkpoint.

# Checkout UI and safe order test

- [x] Add a shared checkout request flow for Agri Farm and Dairy Farm carts.
- [x] Create a pending local order only after server-side cart validation.
- [x] Create a Razorpay order only when valid Test Mode credentials are available (implemented; execution remains gated until valid credentials pass authentication).
- [x] Keep a non-charging fallback state when Razorpay credentials are unavailable.
- [x] Add tests for empty carts, invalid products, amount calculation, and pending order creation.
- [x] Verify the checkout UI and save a new checkpoint after successful validation.

# Checkout robustness follow-up

- [x] Aggregate repeated cart products into quantities before submitting checkout.
- [x] Add tests for unavailable products, duplicate quantities, amount calculation, and successful pending-order persistence.
- [x] Verify both Agri Farm and Dairy Farm pending-order interactions end to end before checkpointing (routes rendered, shared mutation wired, persistence integration test passed).

# Admin dashboard implementation

- [x] Add inventory quantity, reorder threshold, fulfillment status, and tracking fields to the database.
- [x] Add protected admin-only procedures for dashboard metrics, order updates, fulfillment updates, and inventory edits.
- [x] Build the admin dashboard route with overview metrics, order management, fulfillment controls, and inventory editing.
- [x] Enforce admin role access and provide clear unauthorized/loading/error states.
- [x] Add Vitest coverage for admin authorization and core update operations.
- [x] Verify the dashboard on desktop and mobile, then save a new checkpoint.

# Admin verification follow-up

- [x] Add successful integration tests for updating an order and editing inventory, with database assertions and cleanup.
- [x] Verify authenticated admin overview, order management, and inventory editing states on desktop and mobile.
- [x] Save a fresh checkpoint after the authenticated admin verification.

# Customer order tracking implementation

- [x] Add a secure customer order lookup procedure using order ID and customer email or phone.
- [x] Build the `/track-order` page with search, order summary, shipment status, carrier, and tracking details.
- [x] Add a visual fulfillment timeline and clear loading, not-found, and pending-payment states.
- [x] Add storefront navigation to the tracking page.
- [x] Add Vitest coverage for lookup authorization and not-found behavior.
- [x] Verify the tracking page on desktop and mobile, then save a new checkpoint.

# Tracking refinement follow-up

- [x] Add a dedicated pending-payment message and next-step guidance to the tracking page.
- [x] Save a fresh checkpoint after the tracking refinement and verification.

# Live checkout payment update

- [x] Replace placeholder checkout messaging on all storefront checkout surfaces.
- [x] Connect cart checkout to the existing server-side Razorpay order procedure when valid credentials are available (implemented; gateway execution remains credential-gated).
- [x] Add Razorpay Checkout launch and payment callback states without exposing secrets.
- [x] Preserve a clear non-charging fallback when credentials are unavailable or invalid.
- [x] Add tests and verify the checkout UI before saving a payment-ready checkpoint.

# Payment-ready checkout update

- [x] Replace all remaining placeholder checkout actions with a shared payment-aware checkout flow.
- [x] Call server-side Razorpay order creation and expose only public checkout configuration to the browser.
- [x] Add payment success, failure, cancellation, pending, and safe fallback states.
- [x] Add payment-flow tests without charging real customers.
- [x] Verify Agri Farm, Dairy Farm, and homepage checkout behavior and save a new checkpoint.

# Payment-flow verification follow-up

- [x] Add tests for the checkout fallback response, public checkout configuration, and payment verification success/failure paths.
- [x] Add explicit cancelled and failed payment handling with clear pending-verification messaging.
- [x] Exercise checkout interactions on Home, Shop, Agri Farm, and Dairy Farm without charging customers.
- [x] Save a fresh checkpoint after the payment-flow verification.

# Contact details update

- [x] Replace storefront contact email with subbamohanb@gmail.com.
- [x] Replace storefront contact phone with +91 80964 13082 and use a tel link.
- [x] Verify the contact details on desktop and mobile, then save a checkpoint.

# Contact verification follow-up

- [x] Verify the updated email and phone links on the desktop homepage and Shop page.
- [x] Save a fresh checkpoint after the desktop verification.

# Shop contact correction

- [x] Add +91 80964 13082 as a tel link to the Shop page footer.
- [x] Re-verify Shop contact details on desktop and save a fresh checkpoint.

# Mobile push notifications and Android packaging

- [x] Add persistent pushTokens storage and apply the non-destructive database migration.
- [x] Add Expo token registration through the public tRPC notifications.registerToken procedure.
- [x] Send order-status and delivery notifications through Expo Push Service after admin fulfillment updates.
- [x] Clean up DeviceNotRegistered tokens and add unit coverage for Expo token validation.
- [x] Register mobile device tokens, configure the Android notification channel, and deep-link notification taps to Track Order.
- [x] Add EAS development, preview APK, and production AAB build profiles.
- [x] Document EAS initialization, project ID configuration, push setup, and Android build commands.
- [x] Run website Vitest coverage and mobile TypeScript validation successfully.

# Razorpay Live Mode activation request

- [x] Attempt Razorpay Live Mode validation without exposing secrets or charging a customer; HTTP 401 persists, so safe fallback remains enabled.
- [x] Document the current S.M FARMS ownership and access state in OWNERSHIP.md; production charging remains disabled pending valid Razorpay credentials.

# Live credential re-validation and Android project repair

- [x] Re-validate the updated Razorpay Live credentials against the read-only endpoint without charging customers; validation returned HTTP 401.
- [x] Inspect and document the Android project path; the canonical workspace is the repository mobile/ directory.
- [x] Verify mobile/ contains package.json and eas.json for the preview APK build.

# Checkout resilience and transaction history

- [x] Add a loading spinner and disabled state while Razorpay checkout is initializing.
- [x] Show a clear recovery message when the Razorpay checkout script or gateway fails to load.
- [x] Add a secure customer transaction-history lookup for successful and failed payment attempts.
- [x] Build and register a responsive transaction history page with empty, loading, and error states.
- [x] Add unit/integration tests and verify the updated checkout and history flows.

# Transaction history privacy and validation follow-up

- [x] Require order ID plus matching email or phone for transaction-history access and return only masked payment-safe fields.
- [x] Add persistence coverage for matching and mismatched transaction-history lookups.
- [x] Add checkout behavior coverage for gateway initialization failure messaging and busy-button state.
- [x] Re-run the validation set and document the separate Razorpay credential-test blocker if credentials remain invalid.

# Checkout busy-button verification follow-up

- [x] Add a rendered shared-component test that verifies checkout disables the payment button and renders the initialization loading label across the shared storefront pattern.
- [x] Re-run focused checkout and transaction-history validation after the rendered busy-button test is added.

# COD confirmation, payment recovery, and profile tracking

- [x] Add a COD success animation and order confirmation summary page after successful placement.
- [x] Prompt customers to switch to Cash on Delivery when Razorpay initialization or checkout fails.
- [x] Add a customer profile tracking section for COD delivery status.
- [x] Add persistence/router/UI tests and verify responsive checkout and tracking flows; focused validation passed, while the pre-existing Razorpay credential test remains blocked by HTTP 401.

# COD recovery and responsive verification follow-up

- [x] Update all Razorpay onFailure callbacks to surface the COD recovery prompt and set gateway error state.
- [x] Add callback recovery coverage and verify checkout, confirmation, and profile tracking at desktop and mobile widths.

# Checkout recovery evidence follow-up

- [x] Add an interaction-focused test for the Razorpay failure-to-COD recovery prompt.
- [x] Visually verify the recovery prompt and COD switch flow on checkout surfaces at desktop and mobile widths.

# Checkout drawer failure-state verification

- [x] Exercise the production checkout recovery components in a forced Razorpay failure state and capture the COD recovery prompt at desktop and mobile widths.
- [x] Add component-level coverage that invokes the rendered recovery action and verifies the COD fallback callback fires.

# Reusable S.M FARMS skill and catalog growth

- [x] Create and validate a reusable S.M FARMS ecommerce workflow skill with the skill-creator process.
- [x] Add downloadable PDF invoices for successful Cash on Delivery orders from the confirmation page.
- [x] Expand both Agri Farm and Dairy Farm catalogs with additional real product records.
- [x] Add clearly labeled, configurable discount offers and promotional highlights without fabricating reviews or testimonials.
- [x] Add tests, responsive verification, and save a storefront checkpoint.

# Final delivery checkpoint

- [x] Save a new storefront checkpoint covering the reusable skill, COD invoice download, expanded Agri/Dairy catalogs, and highlighted offer pricing; focused feature tests pass, while the separate Razorpay credential test returns HTTP 406.

# Track Order lookup simplification

- [x] Remove email and phone inputs from Track Order.
- [x] Preserve secure lookup with an order-specific tracking token and update the router contract.
- [x] Update tests and responsive verification; checkpoint save is the final delivery step.

# Track Order desktop verification

- [x] Verify the token-based Track Order and Profile forms at desktop width before the final checkpoint.

# Expiring tracking tokens and confirmation controls

- [x] Add an expiry timestamp to tracking tokens and reject expired lookups.
- [x] Add a secure regeneration procedure for an order tracking token.
- [x] Add confirmation-page token instructions, copy button, expiry display, and regeneration feedback.
- [x] Add tests, responsive verification, and save a checkpoint.

# Requested catalog expansion

- [x] Add persistent Agri Farm products for grains, pulses, fresh fruits, fresh vegetables, oilseeds, and spices.
- [x] Add persistent Dairy Farm products for milk, cultured dairy, butter/cream, cheese, ghee, ice cream, and milk sweets.
- [x] Update category labels and storefront presentation for the expanded catalog.
- [x] Add catalog coverage, verify responsive Agri/Dairy pages, and save a checkpoint.

# Promotional banners and catalog browsing refresh

- [x] Add a Fresh Fruits promotional banner and a Dairy promotional banner with a distinctive visual treatment.
- [x] Add search and sorting controls for the expanded Agri/Dairy product catalogs.
- [x] Show pricing, compare-at pricing, and database-backed stock availability for each product.
- [x] Refresh product-card and catalog-section UI styling while preserving checkout behavior.
- [x] Add tests, verify responsive pages, and save a checkpoint.

# New storefront promotion and catalog seeding

- [x] Add a new promotional banner to the storefront.
- [x] Add a featured-products section to the storefront.
- [x] Seed the empty catalog with representative Agri Farm and Dairy Farm products.
- [x] Add or update Vitest coverage for the seeded catalog and featured-product behavior.
- [x] Verify the updated storefront at desktop and mobile widths.

# Featured section behavior validation follow-up

- [x] Add a rendered homepage test for live seeded featured products and empty-catalog fallback behavior.
- [x] Re-run focused validation and document the separate Razorpay credential-test blocker.

> Validation note: the focused storefront, catalog, rendered homepage, and TypeScript checks pass. The separate `server/razorpay.credentials.test.ts` remains blocked because this copy does not have `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`; no payment credentials were changed or exposed.
