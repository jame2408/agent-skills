# Use Partial Indexes for Filtered Queries

**Impact:** HIGH — 5-20x smaller indexes, faster writes and queries

Partial indexes only include rows matching a WHERE condition, making them smaller and faster when queries consistently filter on the same condition.

**Incorrect (full index includes irrelevant rows):**

```sql
CREATE INDEX users_email_idx ON users (email);

-- Query always filters active users, but index includes deleted ones too
SELECT * FROM users WHERE email = 'user@example.com' AND deleted_at IS NULL;
```

**Correct (partial index matches query filter):**

```sql
CREATE INDEX users_active_email_idx ON users (email)
WHERE deleted_at IS NULL;

SELECT * FROM users WHERE email = 'user@example.com' AND deleted_at IS NULL;
```

Common use cases:

```sql
-- Only pending orders (completed orders rarely queried by status)
CREATE INDEX orders_pending_idx ON orders (created_at)
WHERE status = 'pending';

-- Only non-null values
CREATE INDEX products_sku_idx ON products (sku)
WHERE sku IS NOT NULL;
```
