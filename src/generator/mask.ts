import { QRCodeMaskPattern } from 'qrcode'

export const PREVIEW_SIZE = 6

export type MaskOption = {
  value: QRCodeMaskPattern
  path: string
}
export function mask (
  value: QRCodeMaskPattern,
  // (i, j) is like (y, x)
  expression: (i: number, j: number) => number
): MaskOption {
  let path = ''
  for (let i = 0; i < PREVIEW_SIZE; i++) {
    let penDown = false
    // moving horizontally along a row
    for (let j = 0; j < PREVIEW_SIZE; j++) {
      const isFilled = expression(i, j) === 0
      if (isFilled) {
        if (!penDown) {
          path += `M${j} ${i}`
          penDown = true
        }
      } else if (penDown) {
        path += `H${j}`
        penDown = false
      }
    }
    if (penDown) {
      path += `H${PREVIEW_SIZE}`
    }
  }
  return { value, path }
}
