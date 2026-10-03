const AVATAR_PALETTE = [
  ['#E23A50', '#8F1725'],
  ['#FF5A6E', '#C81E33'],
  ['#C81E33', '#6B1019'],
  ['#B91F30', '#4A0C14'],
  ['#8F1725', '#3A0910'],
  ['#D6455A', '#7A1420'],
]

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

function hash(value: string): number {
  let h = 0
  for (let i = 0; i < value.length; i += 1) {
    h = (h << 5) - h + value.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function avatarGradient(seed: string): [string, string] {
  return AVATAR_PALETTE[hash(seed) % AVATAR_PALETTE.length]! as [string, string]
}
