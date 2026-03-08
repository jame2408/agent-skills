# Keep Transactions Short to Reduce Lock Contention

**Impact:** MEDIUM-HIGH — 3-5x throughput improvement, fewer deadlocks

Long-running transactions hold locks that block other queries. Keep transactions as short as possible.

**Incorrect (long transaction with external calls):**

```sql
BEGIN;
SELECT * FROM orders WHERE id = 1 FOR UPDATE;  -- Lock acquired

-- Application makes HTTP call to payment API (2-5 seconds)
-- Other queries on this row are BLOCKED!

UPDATE orders SET status = 'paid' WHERE id = 1;
COMMIT;  -- Lock held for entire duration
```

**Correct (minimal transaction scope):**

```sql
-- Validate data and call APIs OUTSIDE the transaction
-- Application: response = await paymentAPI.charge(...)

-- Only hold lock for the actual update
BEGIN;
UPDATE orders
SET status = 'paid', payment_id = $1
WHERE id = $2 AND status = 'pending'
RETURNING *;
COMMIT;  -- Lock held for milliseconds
```

Use `statement_timeout` to prevent runaway transactions:

```sql
ALTER SYSTEM SET statement_timeout = '30s';

-- Or per-session
SET LOCAL statement_timeout = '5s';
```
