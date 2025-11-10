import { createSlice } from '@reduxjs/toolkit'

const slice = createSlice({
  name: 'queue',
  initialState: { items: [] }, // each item: { type, payload, meta }
  reducers: {
    enqueue: (state, action) => {
      state.items.push(action.payload)
    },
    dequeue: (state) => {
      state.items.shift()
    },
    clearQueue: (state) => {
      state.items = []
    }
  }
})

export const { enqueue, dequeue, clearQueue } = slice.actions
export default slice.reducer
