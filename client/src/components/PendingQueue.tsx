import React from 'react'
import { useSelector } from 'react-redux'

export default function PendingQueue() {
  const queue = useSelector(s => s.queue.items)
  return (
    <div style={{ marginTop: 20 }}>
      <h3>Pending Queue</h3>
      <ol>
        {queue.map((q, idx) => <li key={idx}>{q.type} — payload: {JSON.stringify(q.payload)}</li>)}
      </ol>
    </div>
  )
}
