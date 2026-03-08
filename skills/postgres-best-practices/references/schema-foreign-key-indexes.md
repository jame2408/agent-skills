# Index Foreign Key Columns

**Impact:** HIGH — 10-100x faster JOINs and CASCADE operations

PostgreSQL does not automatically index foreign key columns. Missing indexes cause slow JOINs and CASCADE operations.

**Incorrect (unindexed foreign key):**

```sql
CREATE TABLE orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id bigint REFERENCES customers(id) ON DELETE CASCADE,
  total numeric(10,2)
);

-- No index on customer_id!
SELECT * FROM orders WHERE customer_id = 123;  -- Seq Scan
DELETE FROM customers WHERE id = 123;          -- Scans all orders for cascade
```

**Correct (indexed foreign key):**

```sql
CREATE TABLE orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id bigint REFERENCES customers(id) ON DELETE CASCADE,
  total numeric(10,2)
);

CREATE INDEX orders_customer_id_idx ON orders (customer_id);
```

Find all unindexed foreign keys:

```sql
SELECT
  conrelid::regclass AS table_name,
  a.attname AS fk_column
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey)
  );
```
