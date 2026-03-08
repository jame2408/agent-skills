# Enable pg_stat_statements for Query Analysis

**Impact:** LOW-MEDIUM — Identify top resource-consuming queries

pg_stat_statements tracks execution statistics for all queries, helping identify slow and frequent queries.

**Setup:**

```sql
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

**Find slowest queries by total time:**

```sql
SELECT
  calls,
  round(total_exec_time::numeric, 2) AS total_time_ms,
  round(mean_exec_time::numeric, 2) AS mean_time_ms,
  query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;
```

**Find most frequent queries:**

```sql
SELECT calls, query
FROM pg_stat_statements
ORDER BY calls DESC
LIMIT 10;
```

**Find queries with high mean time (optimization candidates):**

```sql
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- > 100ms average
ORDER BY mean_exec_time DESC;
```

**Reset statistics after optimization:**

```sql
SELECT pg_stat_statements_reset();
```
