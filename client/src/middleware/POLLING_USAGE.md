# Polling Mechanism Usage

The syncMiddleware now supports polling for actions. This allows actions to be automatically re-dispatched at specified intervals.

## How to Use

### 1. Add polling to an action

Pass a `polling` object in your action payload:

```typescript
dispatch(fetchTodos({ 
  loading: true,
  polling: { interval: 5000 } // Poll every 5 seconds
}));
```

### 2. Stop polling

Dispatch a stop polling action:

```typescript
import { stopPollingAction } from './middleware/syncMiddleware';

dispatch(stopPollingAction('todos/fetchTodos'));
```

## Example: Polling in a Hook

```typescript
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchTodos } from './store/todos-slice';
import { stopPollingAction } from './middleware/syncMiddleware';

export const useFetchTodos = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Start polling todos every 10 seconds
    dispatch(fetchTodos({ 
      loading: true,
      polling: { interval: 10000 }
    }));
    
    // Cleanup: stop polling when component unmounts
    return () => {
      dispatch(stopPollingAction('todos/fetchTodos'));
    };
  }, [dispatch]);
};
```

## How It Works

1. When an action with `polling` property is dispatched, the middleware:
   - Processes the action normally (sends to server if sync: true)
   - Sets up an interval that re-dispatches the action (without polling flag)
   
2. Polling continues until:
   - A `polling/stop` action is dispatched for that action type
   - A new polling action of the same type is dispatched (replaces the old one)
   
3. Each poll:
   - Re-dispatches the original action
   - Removes the `polling` property to prevent infinite loop
   - Respects online/offline state
