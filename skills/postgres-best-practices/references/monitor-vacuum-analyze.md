# Maintain Table Statistics with VACUUM and ANALYZE

**Impact:** MEDIUM — 2-10x better query plans with accurate statistics

Outdated statistics cause the query planner to make poor decisions. VACUUM reclaims dead tuple space, ANALYZE updates statistics.

**Incorrect (stale statistics):**

```sql
-- Table has 1M rows but stats say 1000
-- Planner chooses Seq Scan when Index Scan would be much faster
EXPLAIN SELECT * FROM orders WHERE status = 'pending';
```

**Correct (maintain fresh statistics):**

```sql
-- Manually analyze after large data changes
ANALYZE orders;

-- Analyze specific columns used in WHERE clauses
ANALYZE orders (status, created_at);

-- Check when tables were last analyzed
SELECT
  relname,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
ORDER BY last_analyze NULLS FIRST;
```

Autovacuum tuning for busy tables:

```sql
ALTER TABLE orders SET (
  autovacuum_vacuum_scale_factor = 0.05,   -- Vacuum at 5% dead tuples (default 20%)
  autovacuum_analyze_scale_factor = 0.02   -- Analyze at 2% changes (default 10%)
);

-- Check autovacuum progress
SELECT * FROM pg_stat_progress_vacuum;
```
