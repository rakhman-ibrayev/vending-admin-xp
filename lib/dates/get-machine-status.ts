import { isOlderThan } from './is-older-than'

export const getMachineStatus = (
  lastSeen: string | null,
  status: 'offline' | 'online'
) =>
  !lastSeen ||
  isOlderThan(
    lastSeen,
    Number(process.env.NEXT_PUBLIC_VENDING_MACHINE_HEARTBEAT_INTERVAL_MINS)
  )
    ? 'offline'
    : status
