# Use Advisory Locks for Application-Level Locking

**Impact:** MEDIUM — Efficient coordination without row-level lock overhead

Advisory locks provide application-level coordination without requiring database rows to lock on.

**Incorrect (creating rows just for locking):**

```sql
CREATE TABLE resource_locks (resource_name text PRIMARY KEY);
INSERT INTO resource_locks VALUES ('report_generator');

SELECT * FROM resource_locks WHERE resource_name = 'report_generator' FOR UPDATE;
```

**Correct (advisory locks):**

```sql
-- Session-level lock (released on disconnect or explicit unlock)
SELECT pg_advisory_lock(hashtext('report_generator'));
-- ... do exclusive work ...
SELECT pg_advisory_unlock(hashtext('report_generator'));

-- Transaction-level lock (released on COMMIT/ROLLBACK)
BEGIN;
SELECT pg_advisory_xact_lock(hashtext('daily_report'));
-- ... do work ...
COMMIT;  -- Lock automatically released
```

Try-lock for non-blocking operations:

```sql
SELECT pg_try_advisory_lock(hashtext('resource_name'));
-- Returns true if acquired, false if already held by another session
```
