import { getCommand } from './get-command'

export function vendProduct(
  slot: number,
  options: {
    motorType?: number
    lightScreenMode?: number
    delay?: number
    timeout?: number
  } = {}
) {
  const command = 0x05 // Motor Run
  const data = [
    slot, // Y1: Motor index
    options.motorType ?? 0x02, // Y2: Default to 2-wire motor
    options.lightScreenMode ?? 0x02, // Y3: Default to light screen mode 2
    options.delay ?? 15, // Y4: Default 1.5s delay
    0, // Y5: Continue flag
    options.timeout ?? 70, // Y6: Default 7s timeout
    2, // Y7: 0.2s lock time
    ...Array(9).fill(0) // Padding
  ]

  return getCommand(command, data)
}
