const AVATAR_PALETTE = [
  ['#2FE4FF', '#0B84C9'],
  ['#C8FF2F', '#4FA800'],
  ['#FF7A59', '#C7330C'],
  ['#B36BFF', '#6A18C9'],
  ['#FFD166', '#D99A00'],
  ['#4ADE80', '#15803D'],
  ['#F472B6', '#BE185D'],
  ['#60A5FA', '#1D4ED8'],
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
