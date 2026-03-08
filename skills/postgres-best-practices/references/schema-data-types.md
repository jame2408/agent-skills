# Choose Appropriate Data Types

**Impact:** HIGH — 50% storage reduction, faster comparisons

Using the right data types reduces storage, improves query performance, and prevents bugs.

**Incorrect (wrong data types):**

```sql
CREATE TABLE users (
  id int,                   -- Will overflow at 2.1 billion
  email varchar(255),       -- Unnecessary length limit
  created_at timestamp,     -- Missing timezone info
  is_active varchar(5),     -- String for boolean
  price varchar(20)         -- String for numeric
);
```

**Correct (appropriate data types):**

```sql
CREATE TABLE users (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,  -- 9 quintillion max
  email text,                     -- No artificial limit, same performance as varchar
  created_at timestamptz,         -- Always store timezone-aware timestamps
  is_active boolean DEFAULT true, -- 1 byte vs variable string length
  price numeric(10,2)             -- Exact decimal arithmetic
);
```

Key guidelines:

- IDs: `bigint` not `int` (future-proofing)
- Strings: `text` not `varchar(n)` unless constraint needed
- Time: `timestamptz` not `timestamp`
- Money: `numeric` not `float` (precision matters)
- Enums: `text` with CHECK constraint or `CREATE TYPE ... AS ENUM`
