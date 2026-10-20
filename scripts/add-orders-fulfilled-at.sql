-- scripts/add-orders-fulfilled-at.sql
--
-- Marks the moment an order's post-payment work (invoice, confirmation email,
-- WhatsApp, courier booking) was started, so it runs exactly once no matter
-- whether the customer's browser or Razorpay's webhook gets there first.
--
-- RUN THIS ON EVERY DATABASE (local AND live) BEFORE deploying the code that
-- uses it. (The code falls back to the old behaviour if the column is
-- missing, but you only get the fix once it exists.)

ALTER TABLE orders
  ADD COLUMN fulfilled_at DATETIME NULL DEFAULT NULL AFTER payment_status;

-- Orders that are already paid were handled by the old code: mark them done
-- so a late webhook can never re-send their emails / re-book couriers.
UPDATE orders
   SET fulfilled_at = COALESCE(updated_at, created_at, NOW())
 WHERE payment_status = 'paid' AND fulfilled_at IS NULL;
