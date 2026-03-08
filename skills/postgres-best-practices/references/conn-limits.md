# Set Appropriate Connection Limits

**Impact:** CRITICAL — Prevent database crashes and memory exhaustion

Too many connections exhaust memory and degrade performance. Set limits based on available resources.

**Incorrect (excessive connections):**

```sql
SHOW max_connections;  -- 500 (way too high for 4GB RAM)

-- Each connection uses 1-3MB RAM
-- 500 connections * 2MB = 1GB just for connections!
```

**Correct (calculate based on resources):**

```sql
-- Recommended for 4GB RAM
ALTER SYSTEM SET max_connections = 100;

-- work_mem * max_connections should not exceed 25% of RAM
ALTER SYSTEM SET work_mem = '8MB';  -- 8MB * 100 = 800MB max
```

Monitor connection usage:

```sql
SELECT count(*), state FROM pg_stat_activity GROUP BY state;
```
