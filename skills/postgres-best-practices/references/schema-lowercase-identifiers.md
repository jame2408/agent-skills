# Use Lowercase Identifiers for Compatibility

**Impact:** MEDIUM — Avoid case-sensitivity bugs with tools and ORMs

PostgreSQL folds unquoted identifiers to lowercase. Quoted mixed-case identifiers require quotes everywhere and cause issues with tools and ORMs.

**Incorrect (mixed-case identifiers):**

```sql
CREATE TABLE "Users" (
  "userId" bigint PRIMARY KEY,
  "firstName" text
);

-- Must always quote or queries fail
SELECT "firstName" FROM "Users" WHERE "userId" = 1;

-- Without quotes: ERROR: relation "users" does not exist
SELECT firstName FROM Users;
```

**Correct (lowercase snake_case):**

```sql
CREATE TABLE users (
  user_id bigint PRIMARY KEY,
  first_name text
);

-- Works without quotes, recognized by all tools
SELECT first_name FROM users WHERE user_id = 1;
```

If stuck with mixed-case, create views as a compatibility layer:

```sql
CREATE VIEW users AS
SELECT "userId" AS user_id, "firstName" AS first_name FROM "Users";
```
