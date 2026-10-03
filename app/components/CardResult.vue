<script setup lang="ts">
import type { CardData, CardFormat, ImageType } from '~/utils/cardRenderer'
import {
  CARD_FORMATS,
  buildFileName,
  canExportWebp,
  canvasToBlob,
  downloadBlob,
  drawCard,
} from '~/utils/cardRenderer'

const props = defineProps<{
  format: CardFormat
  data: CardData | null
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const busy = ref<ImageType | null>(null)
const error = ref('')
const webpSupported = ref(true)

const config = computed(() => CARD_FORMATS[props.format])

onMounted(() => {
  webpSupported.value = canExportWebp()
  render()
})

watch(
  () => props.data,
  () => render(),
  { deep: true },
)

function render() {
  if (!canvas.value || !props.data) return
  try {
    drawCard(canvas.value, props.data, props.format)
    error.value = ''
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal menampilkan kartu.'
  }
}

async function download(type: ImageType) {
  if (!canvas.value || !props.data) return
  busy.value = type
  error.value = ''
  try {
    const blob = await canvasToBlob(canvas.value, type)
    downloadBlob(blob, buildFileName(props.data, props.format, type))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Gagal mengunduh.'
  } finally {
    busy.value = null
  }
}

defineExpose({ download })
</script>

<template>
  <div class="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
    <div class="mb-4 flex items-center justify-between gap-3">
      <div>
        <p class="font-display text-lg tracking-wide text-white">{{ config.label }}</p>
        <p class="text-xs text-white/45">{{ config.ratio }} &middot; {{ config.description }}</p>
      </div>
      <span
        class="rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-[11px] font-bold tracking-wider text-brand-400"
      >
        {{ config.width }}×{{ config.height }}
      </span>
    </div>

    <div
      class="flex items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-ink-950/80 p-3"
      :style="{ minHeight: format === 'vertical' ? '420px' : '300px' }"
    >
      <canvas
        v-show="data"
        ref="canvas"
        class="mx-auto h-auto w-auto max-h-[68vh] max-w-full rounded-lg"
      />
      <p v-if="!data" class="text-sm text-white/35">Pratinjau akan muncul di sini</p>
    </div>

    <div v-if="error" class="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
      {{ error }}
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3">
      <button
        type="button"
        class="btn-brand"
        :disabled="!data || busy !== null"
        @click="download('png')"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ busy === 'png' ? 'Menyimpan…' : 'PNG' }}
      </button>
      <button
        type="button"
        class="btn-ghost"
        :disabled="!data || busy !== null || !webpSupported"
        :title="webpSupported ? 'Unduh WebP' : 'Ekspor WebP tidak didukung oleh browser ini'"
        @click="download('webp')"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        {{ busy === 'webp' ? 'Menyimpan…' : 'WebP' }}
      </button>
    </div>
  </div>
</template>
