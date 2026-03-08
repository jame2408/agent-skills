# Use UPSERT for Insert-or-Update Operations

**Impact:** MEDIUM — Atomic operation, eliminates race conditions

Using separate SELECT-then-INSERT/UPDATE creates race conditions. Use INSERT ... ON CONFLICT for atomic upserts.

**Incorrect (check-then-insert race condition):**

```sql
SELECT * FROM settings WHERE user_id = 123 AND key = 'theme';
-- Two requests both find nothing, both try to insert
INSERT INTO settings (user_id, key, value) VALUES (123, 'theme', 'dark');
-- One fails with duplicate key error!
```

**Correct (atomic UPSERT):**

```sql
INSERT INTO settings (user_id, key, value)
VALUES (123, 'theme', 'dark')
ON CONFLICT (user_id, key)
DO UPDATE SET value = EXCLUDED.value, updated_at = now()
RETURNING *;
```

Insert-or-ignore pattern:

```sql
INSERT INTO page_views (page_id, user_id)
VALUES (1, 123)
ON CONFLICT (page_id, user_id) DO NOTHING;
```
