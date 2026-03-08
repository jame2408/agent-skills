# Use Prepared Statements Correctly with Pooling

**Impact:** HIGH — Avoid prepared statement conflicts in pooled environments

Prepared statements are tied to individual database connections. In transaction-mode pooling, connections are shared, causing conflicts.

**Incorrect (named prepared statements with transaction pooling):**

```sql
PREPARE get_user AS SELECT * FROM users WHERE id = $1;

-- In transaction mode pooling, next request may get different connection
EXECUTE get_user(123);
-- ERROR: prepared statement "get_user" does not exist
```

**Correct (use unnamed statements or session mode):**

```sql
-- Option 1: Use unnamed prepared statements (most ORMs do this automatically)

-- Option 2: Deallocate after use in transaction mode
PREPARE get_user AS SELECT * FROM users WHERE id = $1;
EXECUTE get_user(123);
DEALLOCATE get_user;

-- Option 3: Use session mode pooling (connection held for entire session)
```

Check your driver settings:

```sql
-- Many drivers use prepared statements by default
-- Node.js pg: { prepare: false } to disable
-- JDBC: prepareThreshold=0 to disable
```
