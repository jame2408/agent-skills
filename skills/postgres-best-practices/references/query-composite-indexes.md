# Create Composite Indexes for Multi-Column Queries

**Impact:** HIGH — 5-10x faster multi-column queries

When queries filter on multiple columns, a composite index is more efficient than separate single-column indexes.

**Incorrect (separate indexes require bitmap scan):**

```sql
CREATE INDEX orders_status_idx ON orders (status);
CREATE INDEX orders_created_idx ON orders (created_at);

-- Query must combine both indexes via bitmap scan (slower)
SELECT * FROM orders WHERE status = 'pending' AND created_at > '2024-01-01';
```

**Correct (composite index):**

```sql
-- Equality columns first, range columns last
CREATE INDEX orders_status_created_idx ON orders (status, created_at);

SELECT * FROM orders WHERE status = 'pending' AND created_at > '2024-01-01';
```

**Column order matters** — leftmost prefix rule:

```sql
CREATE INDEX idx ON orders (status, created_at);

-- ✅ Works: WHERE status = 'pending'
-- ✅ Works: WHERE status = 'pending' AND created_at > '2024-01-01'
-- ❌ Cannot use index: WHERE created_at > '2024-01-01' alone
```
