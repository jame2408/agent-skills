# Use Covering Indexes to Avoid Table Lookups

**Impact:** MEDIUM-HIGH — 2-5x faster queries by eliminating heap fetches

Covering indexes include all columns needed by a query, enabling index-only scans that skip the table entirely.

**Incorrect (index scan + heap fetch):**

```sql
CREATE INDEX users_email_idx ON users (email);

-- Must fetch name and created_at from table heap
SELECT email, name, created_at FROM users WHERE email = 'user@example.com';
```

**Correct (index-only scan with INCLUDE):**

```sql
CREATE INDEX users_email_idx ON users (email) INCLUDE (name, created_at);

-- All columns served from index, no table access needed
SELECT email, name, created_at FROM users WHERE email = 'user@example.com';
```

Use INCLUDE for columns you SELECT but don't filter on:

```sql
-- Searching by status, but also need customer_id and total
CREATE INDEX orders_status_idx ON orders (status) INCLUDE (customer_id, total);

SELECT status, customer_id, total FROM orders WHERE status = 'shipped';
```
