const mpProperties = [
  'm',
  'mx',
  'my',
  'mt',
  'mb',
  'mr',
  'ml',
  'p',
  'px',
  'py',
  'pt',
  'pb',
  'pr',
  'pl',
]

const mpConversion = {
  m: 'margin',
  p: 'padding',
}

interface mpConversion {
  m: string
  p: string
}

const xConversion = {
  '': [''],
  x: ['Left', 'Right'],
  y: ['Top', 'Bottom'],
  t: ['Top'],
  b: ['Bottom'],
  l: ['Left'],
  r: ['Right'],
}

function convertMpValue(value: any, multiplier: number) {
  if (typeof value === 'string') return value

  const parsedValue = parseFloat(value)

  if (parsedValue !== parsedValue) return value

  return parsedValue * multiplier
}

function decodeMp(key: string, value: any, multiplier: number) {
  const [mp, x = ''] = key.split('')
  const property = mpConversion[mp as keyof mpConversion]
  const decodedValue = convertMpValue(value, multiplier)

  const decoded: any = {}

  xConversion[x as keyof typeof xConversion]
    .map((x: string) => property + x)
    .forEach((property: string) => {
      decoded[property] = decodedValue
    })

  return decoded
}

function resolveMp(multiplier = 16) {
  return (props: object) => Object.entries(props)
  .filter(([key]) => mpProperties.includes(key as typeof mpProperties[number]))
  .reduce((acc, [key, value]) => ({ ...acc, ...decodeMp(key, value, multiplier), [key]: null }), {})
}

export default resolveMp
