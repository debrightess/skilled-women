# Skilled Woman Foundation

Responsive, dependency-free static website for The Strength of a Skilled Woman Foundation, Port Harcourt, Nigeria.

## Run locally

Serve the repository root with a static HTTP server, for example `python3 -m http.server 8000`, and open `http://localhost:8000`. No package installation or build is needed. Publish the repository root through the existing static hosting setup.

## Site structure

- Root HTML files retain the existing page addresses.
- `css/site.css` provides the shared responsive design.
- `js/site.js` handles navigation, contact email preparation, account-number copying and page interactions.
- `js/paystack-donation.js` is the only active card donation handler.
- Photos are in `img/`; the site icon is `favicon.svg`.

The contact form prepares an email in the visitor's email application. It does not send email automatically or store enquiries. The page explains this before submission. There is no newsletter signup without a subscription service.

## Donations

Bank details are retained from the previous website. Card donations are disabled until the foundation's approved **live public key** is configured in `js/paystack-donation.js`. Visitors see an availability notice and can use bank transfer. Never commit Paystack secret keys.

After configuring the public key, test checkout, cancellation and failure handling in an appropriate Paystack environment. A client-side callback or a URL reference is not proof of a settled transaction. Confirm donations in the Paystack dashboard; implement server-side verification or verified webhooks before automated fulfilment or authoritative receipts.

See `PAYSTACK-INTEGRATION-NOTES.txt` for setup and verification details.

## Content

The six programme areas, first-year target, registration information, bank details, published stories and team members come from the existing website. The 500+ training figure is a **target**, not a count of completed training. Keep programme availability, testimonials and contact information current.
