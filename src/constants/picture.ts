export const PIC_REVIEW_STATUS_ENUM = {
  REVIEWING: 0,
  PASS: 1,
  REJECT: 2
}

export const PIC_REVIEW_STATUS_MAP = {
  0: '待审核',
  1: '通过',
  2: '不通过'
}

export const PIC_REVIEW_STATUS_OPTIONS = Object.keys(PIC_REVIEW_STATUS_MAP).map((key) => {
  return {
    label: PIC_REVIEW_STATUS_MAP[key],
    value: key
  }
})

export function toHexColor(input) {
  const colorValue = input.startsWith('0x') ? input.slice(2) : input
  // 将剩余部分解析成十六进制数，在转成6位十六进制字符串
  const hexColor = parseInt(colorValue, 16).toString(16).padStart(6 ,'0')

  // 返回标准的格式
  return `#${hexColor}`
}
