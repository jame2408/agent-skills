# Index JSONB Columns for Efficient Querying

**Impact:** MEDIUM — 10-100x faster JSONB queries with proper indexing

JSONB queries without indexes scan the entire table. Use GIN indexes for containment queries.

**Incorrect (no index on JSONB):**

```sql
CREATE TABLE products (
  id bigint PRIMARY KEY,
  attributes jsonb
);

-- Full table scan
SELECT * FROM products WHERE attributes @> '{"color": "red"}';
SELECT * FROM products WHERE attributes->>'brand' = 'Acme';
```

**Correct (GIN index for JSONB):**

```sql
-- GIN index for containment operators (@>, ?, ?&, ?|)
CREATE INDEX products_attrs_gin ON products USING gin (attributes);

SELECT * FROM products WHERE attributes @> '{"color": "red"}';

-- Expression index for specific key lookups
CREATE INDEX products_brand_idx ON products ((attributes->>'brand'));

SELECT * FROM products WHERE attributes->>'brand' = 'Acme';
```

Choose the right operator class:

```sql
-- jsonb_ops (default): supports all operators, larger index
CREATE INDEX idx1 ON products USING gin (attributes);

-- jsonb_path_ops: only @> operator, but 2-3x smaller index
CREATE INDEX idx2 ON products USING gin (attributes jsonb_path_ops);
```
