# Prevent Deadlocks with Consistent Lock Ordering

**Impact:** MEDIUM-HIGH — Eliminate deadlock errors, improve reliability

Deadlocks occur when transactions lock resources in different orders. Always acquire locks in a consistent order.

**Incorrect (inconsistent lock ordering):**

```sql
-- Transaction A                   -- Transaction B
BEGIN;                             BEGIN;
UPDATE accounts                    UPDATE accounts
SET balance = balance - 100        SET balance = balance - 50
WHERE id = 1;                      WHERE id = 2;  -- B locks row 2

UPDATE accounts                    UPDATE accounts
SET balance = balance + 100        SET balance = balance + 50
WHERE id = 2;  -- A waits for B   WHERE id = 1;  -- B waits for A
-- DEADLOCK!
```

**Correct (lock rows in consistent order first):**

```sql
BEGIN;
SELECT * FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

Alternative — single atomic statement:

```sql
UPDATE accounts
SET balance = balance + CASE id
  WHEN 1 THEN -100
  WHEN 2 THEN 100
END
WHERE id IN (1, 2);
```

Detect deadlocks:

```sql
SELECT * FROM pg_stat_database WHERE deadlocks > 0;

SET log_lock_waits = on;
SET deadlock_timeout = '1s';
```
