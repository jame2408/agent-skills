# Eliminate N+1 Queries with Batch Loading

**Impact:** MEDIUM-HIGH — 10-100x fewer database round trips

N+1 queries execute one query per item in a loop. Batch them into a single query using arrays or JOINs.

**Incorrect (N+1 queries):**

```sql
-- 1 query to get all users
SELECT id FROM users WHERE active = true;  -- Returns 100 IDs

-- Then 100 queries, one per user
SELECT * FROM orders WHERE user_id = 1;
SELECT * FROM orders WHERE user_id = 2;
-- ... 98 more queries!
-- Total: 101 round trips
```

**Correct (single batch query):**

```sql
-- Use ANY with array
SELECT * FROM orders WHERE user_id = ANY(ARRAY[1, 2, 3, ...]);

-- Or use JOIN
SELECT u.id, u.name, o.*
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.active = true;

-- Total: 1 round trip
```

Application pattern:

```sql
-- Instead of looping: for user in users: query(WHERE user_id = $1)
-- Pass array parameter:
SELECT * FROM orders WHERE user_id = ANY($1::bigint[]);
```
