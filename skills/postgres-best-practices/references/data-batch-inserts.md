# Batch INSERT Statements for Bulk Data

**Impact:** MEDIUM — 10-50x faster bulk inserts

Individual INSERT statements have high overhead. Batch multiple rows in single statements or use COPY.

**Incorrect (individual inserts):**

```sql
INSERT INTO events (user_id, action) VALUES (1, 'click');
INSERT INTO events (user_id, action) VALUES (1, 'view');
INSERT INTO events (user_id, action) VALUES (2, 'click');
-- ... 1000 individual inserts = 1000 round trips
```

**Correct (batch insert):**

```sql
INSERT INTO events (user_id, action) VALUES
  (1, 'click'),
  (1, 'view'),
  (2, 'click'),
  -- ... up to ~1000 rows per batch
  (999, 'view');
```

For large imports, use COPY:

```sql
COPY events (user_id, action, created_at)
FROM '/path/to/data.csv'
WITH (FORMAT csv, HEADER true);

-- Or from stdin in application
COPY events (user_id, action) FROM stdin WITH (FORMAT csv);
1,click
1,view
2,click
\.
```
