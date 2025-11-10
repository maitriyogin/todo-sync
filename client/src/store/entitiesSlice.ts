import { createSlice } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'entities',
  initialState: { items: [] },
  reducers: {
    addLocalItem: (state, action) => {
      // mark as not synced
      state.items.push({ ...action.payload, synced: false })
    },
    replaceAll: (state, action) => {
      state.items = action.payload
    },
    markSynced: (state, action) => {
      const id = action.payload
      const it = state.items.find(i => i.id === id)
      if (it) it.synced = true
    }
  }
})

export const { addLocalItem, replaceAll, markSynced } = slice.actions
export default slice.reducer
