# Use Cursor-Based Pagination Instead of OFFSET

**Impact:** MEDIUM-HIGH — Consistent O(1) performance regardless of page depth

OFFSET-based pagination scans all skipped rows, getting slower on deeper pages. Cursor pagination is O(1).

**Incorrect (OFFSET pagination):**

```sql
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 0;      -- Page 1: scans 20 rows
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 1980;   -- Page 100: scans 2000 rows
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 199980; -- Page 10000: scans 200K rows!
```

**Correct (cursor/keyset pagination):**

```sql
-- Page 1
SELECT * FROM products ORDER BY id LIMIT 20;
-- Application stores last_id = 20

-- Page 2: start after last ID
SELECT * FROM products WHERE id > 20 ORDER BY id LIMIT 20;

-- Page 10000: same speed as page 1
SELECT * FROM products WHERE id > 199980 ORDER BY id LIMIT 20;
```

For multi-column sorting:

```sql
-- Cursor must include all sort columns (row value comparison)
SELECT * FROM products
WHERE (created_at, id) > ('2024-01-15 10:00:00', 12345)
ORDER BY created_at, id
LIMIT 20;
```
