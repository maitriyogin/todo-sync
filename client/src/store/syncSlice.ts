import { createSlice } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'sync',
  initialState: { status: 'idle', lastSyncedAt: null, error: null },
  reducers: {
    startSync: (state) => { state.status = 'syncing'; state.error = null },
    syncSuccess: (state) => { state.status = 'idle'; state.lastSyncedAt = Date.now() },
    syncError: (state, action) => { state.status = 'error'; state.error = action.payload }
  }
})

export const { startSync, syncSuccess, syncError } = slice.actions
export default slice.reducer
