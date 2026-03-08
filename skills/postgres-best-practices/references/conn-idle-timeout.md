# Configure Idle Connection Timeouts

**Impact:** HIGH — Reclaim 30-50% of connection slots from idle clients

Idle connections waste resources. Configure timeouts to automatically reclaim them.

**Incorrect (connections held indefinitely):**

```sql
SHOW idle_in_transaction_session_timeout;  -- 0 (disabled)

-- Connections stay open forever, even when idle
SELECT pid, state, state_change, query
FROM pg_stat_activity
WHERE state = 'idle in transaction';
-- Shows transactions idle for hours, holding locks
```

**Correct (automatic cleanup):**

```sql
-- Terminate connections idle in transaction after 30 seconds
ALTER SYSTEM SET idle_in_transaction_session_timeout = '30s';

-- Terminate completely idle connections after 10 minutes
ALTER SYSTEM SET idle_session_timeout = '10min';

SELECT pg_reload_conf();
```

For pooled connections, also configure at the pooler level:

```ini
# pgbouncer.ini
server_idle_timeout = 60
client_idle_timeout = 300
```
