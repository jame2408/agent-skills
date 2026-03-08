---
name: postgres-best-practices
description: |
  PostgreSQL performance optimization and best practices for query tuning, schema design, indexing, connection management, concurrency, and security.
  Use when: writing or reviewing SQL queries, creating migrations, designing schemas, troubleshooting slow queries, configuring connection pooling, implementing Row Level Security, or optimizing PostgreSQL database performance.
  Covers: index strategies (B-tree, GIN, GiST, BRIN, composite, partial, covering), data types, constraints, partitioning, RLS, EXPLAIN ANALYZE, pg_stat_statements, VACUUM/ANALYZE, deadlock prevention, advisory locks, SKIP LOCKED queues, batch operations, cursor pagination, UPSERT, full-text search, and JSONB indexing.
---

# PostgreSQL Best Practices

Performance optimization guide for PostgreSQL. Rules are organized by impact priority across 8 categories.

## When to Apply

- Writing SQL queries or designing schemas
- Creating or reviewing migrations
- Implementing or tuning indexes
- Diagnosing slow queries with EXPLAIN ANALYZE
- Configuring connection pooling or resource limits
- Implementing Row Level Security (RLS)
- Optimizing concurrency and locking patterns

## Rule Categories by Priority

1. **Query Performance** (CRITICAL) — `references/query-*.md`
2. **Connection Management** (CRITICAL) — `references/conn-*.md`
3. **Security & RLS** (CRITICAL) — `references/security-*.md`
4. **Schema Design** (HIGH) — `references/schema-*.md`
5. **Concurrency & Locking** (MEDIUM-HIGH) — `references/lock-*.md`
6. **Data Access Patterns** (MEDIUM) — `references/data-*.md`
7. **Monitoring & Diagnostics** (LOW-MEDIUM) — `references/monitor-*.md`
8. **Advanced Features** (LOW) — `references/advanced-*.md`

## Quick Reference

### Index Selection

- `WHERE col = val` → B-tree (default)
- `WHERE a = x AND b > y` → Composite B-tree `(a, b)` — equality columns first
- `WHERE jsonb_col @> '{}'` → GIN
- `WHERE tsv @@ query` → GIN (full-text search)
- Time-series on append-only tables → BRIN (10-100x smaller than B-tree)
- Equality-only lookups → Hash

### Data Types

- IDs: `bigint generated always as identity` (not `int`, not `serial`)
- Strings: `text` (not `varchar(255)` — same performance, no artificial limit)
- Timestamps: `timestamptz` (not `timestamp` — always store timezone)
- Money: `numeric(10,2)` (not `float` — exact arithmetic)
- Flags: `boolean` (not `varchar` or `int`)

### Essential Patterns

```sql
-- Composite index: equality first, range last
CREATE INDEX idx ON orders (status, created_at);

-- Covering index: avoid heap fetch
CREATE INDEX idx ON users (email) INCLUDE (name, created_at);

-- Partial index: smaller + faster
CREATE INDEX idx ON users (email) WHERE deleted_at IS NULL;

-- UPSERT: atomic insert-or-update
INSERT INTO settings (user_id, key, value) VALUES (1, 'theme', 'dark')
ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value;

-- Cursor pagination: O(1) vs OFFSET O(n)
SELECT * FROM products WHERE id > $last_id ORDER BY id LIMIT 20;

-- Queue with SKIP LOCKED: parallel workers
UPDATE jobs SET status = 'processing'
WHERE id = (
  SELECT id FROM jobs WHERE status = 'pending'
  ORDER BY created_at LIMIT 1
  FOR UPDATE SKIP LOCKED
) RETURNING *;
```

### Anti-Patterns to Flag

- `SELECT *` in production queries
- `int` for IDs (use `bigint`), `varchar(255)` without reason (use `text`)
- `timestamp` without timezone (use `timestamptz`)
- Random UUIDs (v4) as PKs on large tables (causes index fragmentation)
- `OFFSET` pagination on large tables
- Unparameterized queries (SQL injection risk)
- `GRANT ALL` to application roles
- Unindexed foreign key columns
- Long transactions holding locks during external API calls

### Diagnostic Queries

```sql
-- Slowest queries (requires pg_stat_statements)
SELECT query, mean_exec_time, calls
FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

-- Table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_stat_user_tables ORDER BY pg_total_relation_size(relid) DESC;

-- Unindexed foreign keys
SELECT conrelid::regclass, a.attname
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.contype = 'f'
  AND NOT EXISTS (
    SELECT 1 FROM pg_index i
    WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey)
  );

-- Tables needing VACUUM
SELECT relname, n_dead_tup, last_vacuum, last_autovacuum
FROM pg_stat_user_tables WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
```

### Configuration Baseline

```sql
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET work_mem = '8MB';
ALTER SYSTEM SET idle_in_transaction_session_timeout = '30s';
ALTER SYSTEM SET statement_timeout = '30s';
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
REVOKE ALL ON SCHEMA public FROM public;
SELECT pg_reload_conf();
```

## How to Use References

Read individual files under `references/` for detailed incorrect/correct examples with EXPLAIN output. Each file is self-contained with:
- Why it matters
- Incorrect SQL example
- Correct SQL example
- Additional context

*Patterns adapted from [Supabase Postgres Best Practices](https://github.com/supabase/agent-skills) (MIT License).*
