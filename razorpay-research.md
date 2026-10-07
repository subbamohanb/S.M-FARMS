# Razorpay and UPI research notes

## Official sources reviewed

1. Standard Checkout integration steps: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
2. UPI payment methods: https://razorpay.com/docs/payments/payment-methods/upi/?preferred-country=US
3. Webhooks overview: https://razorpay.com/docs/webhooks/

## Findings

Razorpay Standard Checkout is built around a server-created order, a client-side Checkout launch, an immediate client handler for the payment response, and server-side verification. Razorpay documentation also recommends webhooks for server-side confirmation and operational recovery.

Razorpay's UPI documentation states that UPI is available for India and can be enabled through Checkout. For a new Razorpay user, UPI Intent or UPI QR should be used because the UPI Collect flow is being deprecated effective 28 February 2026, subject to listed exemptions. UPI Intent can launch supported UPI apps after the customer selects the UPI option.

Razorpay webhooks are server-to-server HTTP POST notifications configured in the Razorpay Dashboard. The documentation distinguishes webhooks from Checkout callback_url: standard web integrations should use a client handler for immediate feedback and webhooks for server-side payment status; callback_url is intended for WebView or redirect flows and should not replace webhooks. Relevant events include order.paid, payment.captured, payment.authorized, and payment.failed.

## S.M FARMS implementation implication

Use Razorpay Standard Checkout with UPI enabled, create Razorpay Orders only on the server, store a local pending order before opening Checkout, verify the returned signature on the server, and mark the local order paid only after verified payment confirmation or a verified webhook. Keep RAZORPAY_KEY_SECRET and the webhook secret server-only. Never trust price, amount, or payment status from the browser.
