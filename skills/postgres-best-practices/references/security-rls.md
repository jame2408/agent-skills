# Enable Row Level Security for Multi-Tenant Data

**Impact:** CRITICAL — Database-enforced tenant isolation, prevent data leaks

Row Level Security (RLS) enforces data access at the database level, ensuring users only see their own data regardless of application bugs.

**Incorrect (application-level filtering only):**

```sql
-- Relying only on application to filter
SELECT * FROM orders WHERE user_id = $current_user_id;

-- Bug or bypass exposes all data
SELECT * FROM orders;  -- Returns ALL orders
```

**Correct (database-enforced RLS):**

```sql
-- Enable RLS on the table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy using session variable for user context
CREATE POLICY orders_user_policy ON orders
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::bigint);

-- Force RLS even for table owners
ALTER TABLE orders FORCE ROW LEVEL SECURITY;

-- Set user context before queries (typically done by connection middleware)
SET app.current_user_id = '123';
SELECT * FROM orders;  -- Only returns orders for user 123
```

**Optimize RLS policy performance** — wrap function calls in SELECT to avoid per-row evaluation:

```sql
-- Incorrect: function called for every row
CREATE POLICY p ON orders
  USING (current_setting('app.current_user_id')::bigint = user_id);

-- Correct: subquery evaluated once and cached
CREATE POLICY p ON orders
  USING ((SELECT current_setting('app.current_user_id')::bigint) = user_id);
```

Always index columns used in RLS policies:

```sql
CREATE INDEX orders_user_id_idx ON orders (user_id);
```

Use `security definer` functions for complex multi-table checks:

```sql
CREATE OR REPLACE FUNCTION is_team_member(p_team_id bigint)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = p_team_id
      AND user_id = (SELECT current_setting('app.current_user_id')::bigint)
  );
$$;

CREATE POLICY team_orders_policy ON orders
  USING ((SELECT is_team_member(team_id)));
```
