# Select Optimal Primary Key Strategy

**Impact:** HIGH — Better index locality, reduced fragmentation

Primary key choice affects insert performance, index size, and replication efficiency.

**Incorrect (problematic PK choices):**

```sql
-- serial works but IDENTITY is SQL-standard and preferred
CREATE TABLE users (
  id serial PRIMARY KEY
);

-- Random UUIDs (v4) cause index fragmentation on large tables
CREATE TABLE orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY
);
```

**Correct (optimal PK strategies):**

```sql
-- Use IDENTITY for sequential IDs (SQL-standard, best for most cases)
CREATE TABLE users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY
);

-- For distributed systems needing UUIDs, use UUIDv7 (time-ordered)
-- Requires pg_uuidv7 extension
CREATE TABLE orders (
  id uuid DEFAULT uuid_generate_v7() PRIMARY KEY
);
```

Guidelines:

- Single database: `bigint GENERATED ALWAYS AS IDENTITY` (sequential, 8 bytes)
- Distributed/exposed IDs: UUIDv7 (time-ordered, no fragmentation)
- `serial` works but `identity` is SQL-standard and preferred for new schemas
- Avoid random UUIDs (v4) as PKs on large tables (scattered inserts)
