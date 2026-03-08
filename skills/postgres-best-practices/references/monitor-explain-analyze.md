# Use EXPLAIN ANALYZE to Diagnose Slow Queries

**Impact:** LOW-MEDIUM — Identify exact bottlenecks in query execution

EXPLAIN ANALYZE executes the query and shows actual timings, revealing the true performance bottlenecks.

**Incorrect (guessing at performance issues):**

```sql
SELECT * FROM orders WHERE customer_id = 123 AND status = 'pending';
-- "It must be missing an index" — but which one?
```

**Correct (use EXPLAIN ANALYZE):**

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE customer_id = 123 AND status = 'pending';

-- Example output:
-- Seq Scan on orders (actual time=0.015..450.123 rows=50 loops=1)
--   Filter: ((customer_id = 123) AND (status = 'pending'))
--   Rows Removed by Filter: 999950
--   Buffers: shared hit=5000 read=15000
-- Execution Time: 450.500 ms
```

Key things to look for:

- **Seq Scan on large tables** = missing index
- **Rows Removed by Filter** = poor selectivity or missing index
- **Buffers: read >> hit** = data not cached, needs more shared_buffers
- **Nested Loop with high loops** = consider different join strategy
- **Sort Method: external merge** = work_mem too low
