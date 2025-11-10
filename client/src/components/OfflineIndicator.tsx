import React from 'react'
import { useSelector } from 'react-redux'

export default function OfflineIndicator() {
  const online = useSelector(s => s.network.online)
  const syncing = useSelector(s => s.sync.status === 'syncing')
  return (
    <div>
      <strong>Network:</strong> {online ? 'Online' : 'Offline'}{syncing ? ' — syncing...' : ''}
    </div>
  )
}
