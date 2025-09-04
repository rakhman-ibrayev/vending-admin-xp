import crc16modbus from 'crc/calculators/crc16modbus'

function buildFrame(command: number, data: number[]): number[] {
  const frame = new Array(20).fill(0)
  frame[0] = 0x01
  frame[1] = command
  data.forEach((byte, i) => (frame[i + 2] = byte))

  const crc = crc16modbus(new Uint8Array(frame.slice(0, 18)))
  frame[18] = crc & 0xff
  frame[19] = (crc >> 8) & 0xff

  return frame
}

function toHexString(bytes: number[]): string {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function getCommand(command: number, data: number[]) {
  const frame = buildFrame(command, data)

  return toHexString(frame)
}
