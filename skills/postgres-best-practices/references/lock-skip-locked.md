# Use SKIP LOCKED for Non-Blocking Queue Processing

**Impact:** MEDIUM-HIGH — 10x throughput for worker queues

When multiple workers process a queue, SKIP LOCKED allows workers to process different rows without waiting.

**Incorrect (workers block each other):**

```sql
BEGIN;
SELECT * FROM jobs WHERE status = 'pending' ORDER BY created_at LIMIT 1 FOR UPDATE;
-- Worker 2 waits for Worker 1's lock to release!
```

**Correct (SKIP LOCKED for parallel processing):**

```sql
BEGIN;
SELECT * FROM jobs
WHERE status = 'pending'
ORDER BY created_at
LIMIT 1
FOR UPDATE SKIP LOCKED;
-- Worker 1 gets job 1, Worker 2 gets job 2 (no waiting)

UPDATE jobs SET status = 'processing' WHERE id = $1;
COMMIT;
```

Complete atomic claim pattern:

```sql
UPDATE jobs
SET status = 'processing', worker_id = $1, started_at = now()
WHERE id = (
  SELECT id FROM jobs
  WHERE status = 'pending'
  ORDER BY created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED
)
RETURNING *;
```
