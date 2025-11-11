# TTL (Time-To-Live) Cache Mechanism

The syncMiddleware now uses TTL-based caching for efficient data management. Instead of continuous polling, data is only refetched when it becomes stale (TTL expires).

## How It Works

Each slice tracks:
- `lastFetched`: Timestamp when data was last fetched
- `ttl`: Time-to-live in milliseconds (how long data stays fresh)

When you request data, the system checks if it's stale and only refetches if needed.

## Usage

### 1. Set custom TTL when fetching

```typescript
dispatch(fetchTodos({
  loading: true,
  ttl: 60000 // Data stays fresh for 60 seconds
}));
```

### 2. Check if data is stale and refetch

```typescript
import { checkTodosStale } from './middleware/syncMiddleware';

// This will check TTL and refetch only if stale
dispatch(checkTodosStale());
```

### 3. Using in a Hook

```typescript
import { useFetchTodos } from './api/hooks/useFetchTodos';

function MyComponent() {
  // Initial fetch with 30 second TTL
  const { isStale, checkAndRefresh } = useFetchTodos(30000);

  // Check and refresh when needed (e.g., on focus)
  useEffect(() => {
    const handleFocus = () => checkAndRefresh();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkAndRefresh]);

  // Show stale indicator if needed
  if (isStale) {
    return <div>Data may be outdated... <button onClick={checkAndRefresh}>Refresh</button></div>;
  }
}
```

## Benefits Over Polling

✅ **More efficient** - Only fetches when data is actually stale
✅ **Less network traffic** - No continuous background requests
✅ **Better UX** - Data is always available immediately (stale data is better than no data)
✅ **Configurable** - Different TTLs for different data types
✅ **Smart caching** - Respects online/offline state

## Default Behavior

- Default TTL: 30 seconds
- Data is considered stale if: `Date.now() - lastFetched > ttl`
- First fetch always runs (lastFetched is null)
- TTL can be updated dynamically per fetch
