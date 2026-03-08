# Add Constraints Safely in Migrations

**Impact:** HIGH — Prevents migration failures and enables idempotent schema changes

PostgreSQL does not support `ADD CONSTRAINT IF NOT EXISTS`. Migrations using this syntax will fail.

**Incorrect (causes syntax error):**

```sql
-- ERROR: syntax error at or near "not" (SQLSTATE 42601)
ALTER TABLE public.profiles
ADD CONSTRAINT IF NOT EXISTS profiles_email_unique UNIQUE (email);
```

**Correct (idempotent constraint creation):**

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_email_unique'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_email_unique UNIQUE (email);
  END IF;
END $$;
```

Works for all constraint types:

```sql
-- CHECK constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_age_positive'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT check_age_positive CHECK (age > 0);
  END IF;
END $$;

-- Foreign key
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_customer_id_fkey'
  ) THEN
    ALTER TABLE orders
    ADD CONSTRAINT orders_customer_id_fkey
    FOREIGN KEY (customer_id) REFERENCES customers(id);
  END IF;
END $$;
```

Query existing constraints:

```sql
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass;
-- contype: 'p' = PK, 'f' = FK, 'u' = UNIQUE, 'c' = CHECK
```
