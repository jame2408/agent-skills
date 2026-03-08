# Apply Principle of Least Privilege

**Impact:** MEDIUM — Reduced attack surface, better audit trail

Grant only the minimum permissions required. Never use superuser for application queries.

**Incorrect (overly broad permissions):**

```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Any SQL injection becomes catastrophic
```

**Correct (minimal, specific grants):**

```sql
-- Create role with no default privileges
CREATE ROLE app_readonly NOLOGIN;
GRANT USAGE ON SCHEMA public TO app_readonly;
GRANT SELECT ON public.products, public.categories TO app_readonly;

-- Create role for writes with limited scope
CREATE ROLE app_writer NOLOGIN;
GRANT USAGE ON SCHEMA public TO app_writer;
GRANT SELECT, INSERT, UPDATE ON public.orders TO app_writer;
GRANT USAGE ON SEQUENCE orders_id_seq TO app_writer;
-- No DELETE permission

-- Login role inherits from these
CREATE ROLE app_user LOGIN PASSWORD 'xxx';
GRANT app_writer TO app_user;
```

Revoke public defaults:

```sql
REVOKE ALL ON SCHEMA public FROM public;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;
```
