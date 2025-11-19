import type { SSEEventName } from '@/app/api/vending-machines/sse/[serial_number]/route'
import { useMutation } from '@tanstack/react-query'

interface BroadcastParams {
  serial_number: string
  event: SSEEventName
  data?: any
}

interface BroadcastResponse {
  success: boolean
  sent: boolean
  message: string
}

export function useBroadcastToMachine() {
  return useMutation({
    mutationFn: async (params: BroadcastParams): Promise<BroadcastResponse> => {
      const response = await fetch(
        `/api/vending-machines/sse/${params.serial_number}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: params.event,
            data: params.data
          })
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to broadcast event')
      }

      return response.json()
    },
    onError: error => {
      console.error('Failed to broadcast event:', error)
    }
  })
}
