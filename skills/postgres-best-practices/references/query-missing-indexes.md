# Add Indexes on WHERE and JOIN Columns

**Impact:** CRITICAL — 100-1000x faster queries on large tables

Queries filtering or joining on unindexed columns cause full table scans, which become exponentially slower as tables grow.

**Incorrect (sequential scan on large table):**

```sql
-- No index on customer_id causes full table scan
SELECT * FROM orders WHERE customer_id = 123;

-- EXPLAIN shows: Seq Scan on orders (cost=0.00..25000.00 rows=100 width=85)
```

**Correct (index scan):**

```sql
CREATE INDEX orders_customer_id_idx ON orders (customer_id);

SELECT * FROM orders WHERE customer_id = 123;

-- EXPLAIN shows: Index Scan using orders_customer_id_idx (cost=0.42..8.44 rows=100 width=85)
```

For JOIN columns, always index the foreign key side:

```sql
CREATE INDEX orders_customer_id_idx ON orders (customer_id);

SELECT c.name, o.total
FROM customers c
JOIN orders o ON o.customer_id = c.id;
```
