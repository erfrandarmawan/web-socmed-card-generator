export type CardFormat = 'vertical' | 'square'
export type ImageType = 'png' | 'webp'

export interface CardData {
  playerName: string
  team?: string
  country?: string
  position?: string
  number?: number | string
  minute: number
  additional?: number | null
}

export interface CardFormatConfig {
  key: CardFormat
  label: string
  ratio: string
  width: number
  height: number
  description: string
}

export const CARD_FORMATS: Record<CardFormat, CardFormatConfig> = {
  vertical: {
    key: 'vertical',
    label: 'Vertical',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    description: 'Stories, Reels & TikTok',
  },
  square: {
    key: 'square',
    label: 'Square',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    description: 'Feed & timelines',
  },
}

export const CARD_FORMAT_LIST: CardFormatConfig[] = [
  CARD_FORMATS.vertical,
  CARD_FORMATS.square,
]

const ACCENT = '#C8FF2F'
const ACCENT_SOFT = 'rgba(200, 255, 47, 0.12)'
const CYAN = '#2FE4FF'
const WHITE = '#FFFFFF'
const MUTED = 'rgba(255, 255, 255, 0.58)'

interface Layout {
  badgeH: number
  badgeY: number
  minuteSize: number
  dividerW: number
  dividerH: number
  nameSize: number
  nameLH: number
  teamSize: number
  metaSize: number
  gaps: {
    minuteToDiv: number
    divToName: number
    nameToTeam: number
    teamToMeta: number
  }
  groupCenter: number
}

const LAYOUTS: Record<CardFormat, Layout> = {
  vertical: {
    badgeH: 76,
    badgeY: 182,
    minuteSize: 400,
    dividerW: 240,
    dividerH: 7,
    nameSize: 116,
    nameLH: 132,
    teamSize: 50,
    metaSize: 40,
    gaps: { minuteToDiv: 58, divToName: 58, nameToTeam: 58, teamToMeta: 34 },
    groupCenter: 0.505,
  },
  square: {
    badgeH: 62,
    badgeY: 122,
    minuteSize: 300,
    dividerW: 180,
    dividerH: 6,
    nameSize: 88,
    nameLH: 100,
    teamSize: 40,
    metaSize: 32,
    gaps: { minuteToDiv: 44, divToName: 44, nameToTeam: 44, teamToMeta: 26 },
    groupCenter: 0.545,
  },
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const base = ctx.createLinearGradient(0, 0, 0, h)
  base.addColorStop(0, '#0b1224')
  base.addColorStop(0.45, '#080d19')
  base.addColorStop(1, '#04060c')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  const glow = ctx.createRadialGradient(
    w * 0.5,
    h * 0.44,
    w * 0.04,
    w * 0.5,
    h * 0.44,
    Math.max(w, h) * 0.78,
  )
  glow.addColorStop(0, 'rgba(47, 228, 255, 0.18)')
  glow.addColorStop(0.42, 'rgba(200, 255, 47, 0.08)')
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.globalAlpha = 0.04
  ctx.strokeStyle = WHITE
  ctx.lineWidth = 2
  const step = 48
  for (let x = -h; x < w + h; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x + h, h)
    ctx.stroke()
  }
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(w * 0.5, h * 1.04, w * 0.66, Math.PI, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(w * 0.5, h * 1.04, w * 0.3, Math.PI, Math.PI * 2)
  ctx.stroke()
  ctx.restore()

  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.22,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.72,
  )
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, w, h)
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  label: string,
  layout: Layout,
) {
  const fontSize = layout.badgeH * 0.42
  ctx.font = `700 ${fontSize}px "Inter", system-ui, sans-serif`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  const textWidth = ctx.measureText(label).width
  const dot = layout.badgeH * 0.16
  const padX = layout.badgeH * 0.62
  const gap = layout.badgeH * 0.34
  const pillW = padX * 2 + dot * 2 + gap + textWidth
  const x = cx - pillW / 2
  const y = cy - layout.badgeH / 2

  ctx.fillStyle = ACCENT_SOFT
  roundRect(ctx, x, y, pillW, layout.badgeH, layout.badgeH / 2)
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = 'rgba(200, 255, 47, 0.65)'
  ctx.stroke()

  ctx.beginPath()
  ctx.fillStyle = ACCENT
  ctx.arc(x + padX + dot, cy, dot, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = ACCENT
  ctx.fillText(label, x + padX + dot * 2 + gap, cy + 2)
}

function drawCornerNumber(
  ctx: CanvasRenderingContext2D,
  w: number,
  cy: number,
  number: number | string | undefined,
  layout: Layout,
) {
  if (number === undefined || number === null || number === '') return
  const fontSize = layout.badgeH * 0.66
  ctx.font = `400 ${fontSize}px "Anton", system-ui, sans-serif`
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)'
  ctx.fillText(`#${number}`, w - 88, cy + 2)
}

interface Segment {
  text: string
  font: string
  color: string
  dy?: number
}

function drawCenteredSegments(
  ctx: CanvasRenderingContext2D,
  segments: Segment[],
  centerX: number,
  centerY: number,
) {
  const widths = segments.map((seg) => {
    ctx.font = seg.font
    return ctx.measureText(seg.text).width
  })
  const total = widths.reduce((sum, width) => sum + width, 0)
  let x = centerX - total / 2
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  segments.forEach((seg, index) => {
    ctx.font = seg.font
    ctx.fillStyle = seg.color
    ctx.fillText(seg.text, x, centerY + (seg.dy ?? 0))
    x += widths[index] ?? 0
  })
}

function drawDivider(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  layout: Layout,
) {
  const x = cx - layout.dividerW / 2
  const gradient = ctx.createLinearGradient(x, y, x + layout.dividerW, y)
  gradient.addColorStop(0, 'rgba(200, 255, 47, 0)')
  gradient.addColorStop(0.5, ACCENT)
  gradient.addColorStop(1, 'rgba(47, 228, 255, 0)')
  ctx.fillStyle = gradient
  roundRect(ctx, x, y, layout.dividerW, layout.dividerH, layout.dividerH / 2)
  ctx.fill()
}

export function formatMinute(
  minute: number,
  additional?: number | null,
): { main: string; extra: string } {
  const main = `${minute}\u2019`
  const extra = additional && additional > 0 ? `+${additional}` : ''
  return { main, extra }
}

export function drawCard(
  canvas: HTMLCanvasElement,
  data: CardData,
  format: CardFormat,
) {
  const config = CARD_FORMATS[format]
  const layout = LAYOUTS[format]
  const w = config.width
  const h = config.height

  canvas.width = w
  canvas.height = h

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is not available.')

  ctx.clearRect(0, 0, w, h)
  drawBackground(ctx, w, h)

  const cx = w / 2
  const { main, extra } = formatMinute(data.minute, data.additional)

  ctx.font = `400 ${layout.nameSize}px "Anton", system-ui, sans-serif`
  const nameLines = wrapText(ctx, data.playerName.toUpperCase(), w - 200)
  const nameBlockH = nameLines.length * layout.nameLH

  const minuteBlockH = layout.minuteSize * 0.8
  const teamBlockH = layout.teamSize * 0.9
  const metaBlockH = layout.metaSize * 0.9

  const groupH =
    minuteBlockH +
    layout.gaps.minuteToDiv +
    layout.dividerH +
    layout.gaps.divToName +
    nameBlockH +
    layout.gaps.nameToTeam +
    teamBlockH +
    layout.gaps.teamToMeta +
    metaBlockH

  const groupTop = h * layout.groupCenter - groupH / 2

  const minuteCenterY = groupTop + minuteBlockH / 2

  const minuteFont = `400 ${layout.minuteSize}px "Anton", system-ui, sans-serif`
  const extraSize = layout.minuteSize * 0.42
  const extraFont = `400 ${extraSize}px "Anton", system-ui, sans-serif`

  const segments: Segment[] = [
    { text: main, font: minuteFont, color: WHITE },
  ]
  if (extra) {
    segments.push({
      text: extra,
      font: extraFont,
      color: ACCENT,
      dy: -layout.minuteSize * 0.22,
    })
  }
  drawCenteredSegments(ctx, segments, cx, minuteCenterY)

  const dividerTop = groupTop + minuteBlockH + layout.gaps.minuteToDiv
  drawDivider(ctx, cx, dividerTop, layout)

  const nameTop = dividerTop + layout.dividerH + layout.gaps.divToName
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = WHITE
  ctx.font = `400 ${layout.nameSize}px "Anton", system-ui, sans-serif`
  nameLines.forEach((line, index) => {
    const y = nameTop + index * layout.nameLH + layout.nameLH / 2
    ctx.fillText(line, cx, y)
  })

  const nameBottom = nameTop + nameBlockH
  const teamCenterY = nameBottom + layout.gaps.nameToTeam + teamBlockH / 2
  ctx.font = `700 ${layout.teamSize}px "Inter", system-ui, sans-serif`
  ctx.fillStyle = ACCENT
  const teamText = (data.team || '').toUpperCase()
  ctx.fillText(teamText, cx, teamCenterY)

  const metaCenterY =
    nameBottom + layout.gaps.nameToTeam + teamBlockH + layout.gaps.teamToMeta + metaBlockH / 2
  const metaParts = [data.position, data.country].filter(Boolean).join('  \u2022  ')
  if (metaParts) {
    ctx.font = `500 ${layout.metaSize}px "Inter", system-ui, sans-serif`
    ctx.fillStyle = MUTED
    ctx.fillText(metaParts.toUpperCase(), cx, metaCenterY)
  }

  drawBadge(ctx, cx, layout.badgeY, 'GOAL', layout)
  drawCornerNumber(ctx, w, layout.badgeY, data.number, layout)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `600 ${layout.metaSize * 0.8}px "Inter", system-ui, sans-serif`
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)'
  ctx.fillText('MATCH MOMENT', cx, h - 84)
}

export function canExportWebp(): boolean {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    return canvas.toDataURL('image/webp').startsWith('data:image/webp')
  } catch {
    return false
  }
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: ImageType,
  quality = 0.95,
): Promise<Blob> {
  const mime = type === 'png' ? 'image/png' : 'image/webp'
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error(`Failed to export ${type.toUpperCase()} image.`))
      },
      mime,
      type === 'webp' ? quality : undefined,
    )
  })
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildFileName(
  data: CardData,
  format: CardFormat,
  type: ImageType,
): string {
  const { main, extra } = formatMinute(data.minute, data.additional)
  const minute = extra ? `${main}${extra}` : main
  const minuteSlug = minute.replace(/[^0-9+]/g, '')
  return `goal-${slugify(data.playerName)}-${minuteSlug}min-${format}.${type}`
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export async function ensureFontsReady(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return
  try {
    await Promise.all([
      document.fonts.load('400 320px "Anton"'),
      document.fonts.load('700 64px "Inter"'),
      document.fonts.load('600 48px "Inter"'),
      document.fonts.load('500 40px "Inter"'),
    ])
    await document.fonts.ready
  } catch {
    // Rendering will gracefully fall back to system fonts.
  }
}
