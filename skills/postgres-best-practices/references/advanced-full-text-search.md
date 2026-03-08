# Use tsvector for Full-Text Search

**Impact:** MEDIUM — 100x faster than LIKE, with ranking support

LIKE with wildcards cannot use indexes. Full-text search with tsvector is orders of magnitude faster.

**Incorrect (LIKE pattern matching):**

```sql
SELECT * FROM articles WHERE content LIKE '%postgresql%';
SELECT * FROM articles WHERE lower(content) LIKE '%postgresql%';
-- Full table scan, cannot use index
```

**Correct (full-text search with tsvector):**

```sql
-- Add generated tsvector column and GIN index
ALTER TABLE articles ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''))
  ) STORED;

CREATE INDEX articles_search_idx ON articles USING gin (search_vector);

-- Fast full-text search
SELECT * FROM articles
WHERE search_vector @@ to_tsquery('english', 'postgresql & performance');

-- With ranking
SELECT *, ts_rank(search_vector, query) AS rank
FROM articles, to_tsquery('english', 'postgresql') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

Search operators:

```sql
to_tsquery('postgresql & performance')  -- AND: both terms required
to_tsquery('postgresql | mysql')        -- OR: either term
to_tsquery('post:*')                    -- Prefix matching
```
