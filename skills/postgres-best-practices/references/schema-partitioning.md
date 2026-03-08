# Partition Large Tables for Better Performance

**Impact:** MEDIUM-HIGH — 5-20x faster queries and maintenance on large tables

Partitioning splits a large table into smaller pieces, improving query performance and maintenance operations.

**Incorrect (single large table):**

```sql
CREATE TABLE events (
  id bigint GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz,
  data jsonb
);

-- 500M rows, queries scan everything
SELECT * FROM events WHERE created_at > '2024-01-01';  -- Slow
VACUUM events;  -- Takes hours
```

**Correct (partitioned by time range):**

```sql
CREATE TABLE events (
  id bigint GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz NOT NULL,
  data jsonb
) PARTITION BY RANGE (created_at);

CREATE TABLE events_2024_01 PARTITION OF events
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE events_2024_02 PARTITION OF events
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Queries only scan relevant partitions (partition pruning)
SELECT * FROM events WHERE created_at > '2024-01-15';

-- Drop old data instantly instead of slow DELETE
DROP TABLE events_2023_01;
```

When to partition:

- Tables > 100M rows
- Time-series data with date-based queries
- Need to efficiently drop old data
