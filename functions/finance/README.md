# Financial Engine

The Financial Engine serves as the ultimate system of record for SoulThread. By utilizing an immutable, double-entry ledger, it securely abstracts away third-party payment gateways (Razorpay/Stripe).

## Core Modules

1. **Ledger Engine (`LedgerService.js`, `LedgerRepository.js`)**:
   Enforces a strict double-entry pattern. A $100 session automatically generates 3 atomic entries:
   - CREDIT $100 to `PLATFORM_GROSS`
   - DEBIT $20 to `PLATFORM_COMMISSION`
   - CREDIT $80 to `GUIDE_PAYABLE_{id}`

2. **Payment Engine (`PaymentService.js`, `financeAPI.js`, `financeWebhooks.js`)**:
   - Manages payment intents for gateways.
   - Provides a secure endpoint (`razorpayWebhook`) that cryptographically verifies payload signatures before processing.
   - Supports first-class `Cash` transactions via `recordCashPayment`, immediately generating identical Ledger Entries.

3. **Invoice Engine (`InvoiceService.js`)**:
   - Listens to `PaymentSucceeded` events via the Event Bus.
   - Automatically generates unique `INV-YYYYMMDD-HASH` IDs and isolates Base Amounts from GST.

4. **Refund Engine (`RefundService.js`)**:
   - Triggered when the Booking Engine emits `BookingCancelled`.
   - Reverses the exact Gross, Commission, and Earnings calculations in the Ledger automatically.

5. **Settlement Engine (`SettlementService.js`, `financeCron.js`)**:
   - A weekly PubSub CRON job that aggregates a Guide's unpaid `GUIDE_PAYABLE` credits.
   - Generates a payout file and debits the account to zero.

## Security & Reliability
- **Idempotency**: Webhook processing ensures multiple identical hits from Razorpay do not double-process the ledger.
- **Zero-Trust**: The UI cannot submit the price. `financeAPI` dynamically resolves the finalized price from the backend `Booking` document.
- **Audit Trails**: Invalid webhook signatures are dumped into `financial_audit_logs`.

## Integration
All operations are fully decoupled via `EventPublisher` and `FinanceSubscriber`. The Booking Engine seamlessly pushes to `CONFIRMED` only when it receives `PaymentSucceeded` from this engine.
