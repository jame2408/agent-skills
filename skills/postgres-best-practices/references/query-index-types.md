# Choose the Right Index Type for Your Data

**Impact:** HIGH — 10-100x improvement with correct index type

Different index types excel at different query patterns. The default B-tree isn't always optimal.

**Incorrect (B-tree for JSONB containment):**

```sql
CREATE INDEX products_attrs_idx ON products (attributes);
SELECT * FROM products WHERE attributes @> '{"color": "red"}';
-- Full table scan — B-tree doesn't support @> operator
```

**Correct (GIN for JSONB):**

```sql
CREATE INDEX products_attrs_idx ON products USING gin (attributes);
SELECT * FROM products WHERE attributes @> '{"color": "red"}';
```

**Index type guide:**

```sql
-- B-tree (default): =, <, >, BETWEEN, IN, IS NULL
CREATE INDEX users_created_idx ON users (created_at);

-- GIN: arrays, JSONB, full-text search
CREATE INDEX posts_tags_idx ON posts USING gin (tags);

-- GiST: geometric data, range types, nearest-neighbor (KNN)
CREATE INDEX locations_idx ON places USING gist (location);

-- BRIN: large time-series / append-only tables (10-100x smaller)
CREATE INDEX events_time_idx ON events USING brin (created_at);

-- Hash: equality-only (slightly faster than B-tree for =)
CREATE INDEX sessions_token_idx ON sessions USING hash (token);
```
