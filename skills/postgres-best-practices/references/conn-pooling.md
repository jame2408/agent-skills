# Use Connection Pooling for All Applications

**Impact:** CRITICAL — Handle 10-100x more concurrent users

PostgreSQL connections are expensive (1-3MB RAM each). Without pooling, applications exhaust connections under load.

**Incorrect (new connection per request):**

```sql
-- Each request creates a new connection
-- 500 concurrent users = 500 connections = crashed database

SELECT count(*) FROM pg_stat_activity;  -- 487 connections!
```

**Correct (connection pooling via PgBouncer or similar):**

```sql
-- Application connects to pooler, pooler reuses a small pool to Postgres
-- Configure pool_size based on: (CPU cores * 2) + effective_spindle_count
-- Example for 4 cores: pool_size = 10

-- 500 concurrent users share 10 actual connections
SELECT count(*) FROM pg_stat_activity;  -- 10 connections
```

Pool modes:

- **Transaction mode**: connection returned after each transaction (best for most apps)
- **Session mode**: connection held for entire session (needed for prepared statements, temp tables)
