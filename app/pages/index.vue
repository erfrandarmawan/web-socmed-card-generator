<script setup lang="ts">
import type { Player } from '~/types'
import type { CardData } from '~/utils/cardRenderer'
import playersData from '~/data/players.json'

const players = playersData as Player[]

const selectedPlayer = ref<Player | null>(null)
const minuteInput = ref('')
const additionalInput = ref('')
const generated = ref(false)
const isGenerating = ref(false)
const progress = ref(0)

const INJURY_TIMES = [45, 90, 105, 120]

const minute = computed<number | null>(() => {
  if (minuteInput.value === '') return null
  const value = Number(minuteInput.value)
  if (Number.isNaN(value)) return null
  return Math.round(value)
})

const isInjuryTime = computed(
  () => minute.value !== null && INJURY_TIMES.includes(minute.value),
)

const additional = computed<number | null>(() => {
  if (!isInjuryTime.value || additionalInput.value === '') return null
  const value = Number(additionalInput.value)
  if (Number.isNaN(value) || value <= 0) return null
  return Math.round(value)
})

const canGenerate = computed(
  () =>
    !!selectedPlayer.value &&
    minute.value !== null &&
    minute.value >= 1 &&
    minute.value <= 120 &&
    !isGenerating.value,
)

const cardData = computed<CardData | null>(() => {
  if (!generated.value || !selectedPlayer.value || minute.value === null) return null
  if (minute.value < 1 || minute.value > 120) return null
  return {
    playerName: selectedPlayer.value.name,
    team: selectedPlayer.value.team,
    country:
      selectedPlayer.value.country === selectedPlayer.value.team
        ? ''
        : selectedPlayer.value.country,
    position: selectedPlayer.value.position,
    number: selectedPlayer.value.number,
    minute: minute.value,
    additional: additional.value,
  }
})

const timePreview = computed(() => {
  if (minute.value === null) return '—'
  const base = `${minute.value}′`
  return additional.value ? `${base} +${additional.value}` : base
})

watch(minute, (value) => {
  if (value === null || !INJURY_TIMES.includes(value)) {
    additionalInput.value = ''
  }
})

function clampMinute() {
  if (minuteInput.value === '') return
  const value = Number(minuteInput.value)
  if (Number.isNaN(value)) {
    minuteInput.value = ''
    return
  }
  minuteInput.value = String(Math.max(1, Math.min(120, Math.round(value))))
}

function clampAdditional() {
  if (additionalInput.value === '') return
  const value = Number(additionalInput.value)
  if (Number.isNaN(value)) {
    additionalInput.value = ''
    return
  }
  additionalInput.value = String(Math.max(0, Math.min(30, Math.round(value))))
}

function pickMinute(value: number) {
  minuteInput.value = String(value)
}

async function generate() {
  if (!canGenerate.value) return
  isGenerating.value = true
  progress.value = 6

  const timer = window.setInterval(() => {
    progress.value = Math.min(progress.value + 9 + Math.random() * 14, 90)
  }, 130)

  try {
    await ensureFontsReady()
    await nextTick()
    await new Promise((resolve) => window.setTimeout(resolve, 420))
  } finally {
    window.clearInterval(timer)
    progress.value = 100
    await new Promise((resolve) => window.setTimeout(resolve, 240))
    generated.value = true
    isGenerating.value = false
  }
}

function reset() {
  selectedPlayer.value = null
  minuteInput.value = ''
  additionalInput.value = ''
  generated.value = false
  progress.value = 0
}
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
    <header class="mb-10 max-w-3xl">
      <h1 class="mt-5 font-display text-4xl uppercase leading-none tracking-wide sm:text-6xl">
        Generator Kartu <span class="text-brand-500">Gol</span>
      </h1>
      <p class="mt-4 text-base text-white/55">
        Buat kartu pengumuman gol untuk penggemar sepak bola dan akun fanbase. Pilih
        pemain dan menit pertandingan, lalu unduh gambar dalam format vertikal (9:16)
        dan persegi (1:1).
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-[minmax(0,400px)_1fr] lg:items-start">
      <section class="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 lg:sticky lg:top-6">
        <div class="space-y-5">
          <div>
            <label class="field-label">Nama pemain</label>
            <PlayerCombobox v-model="selectedPlayer" :players="players" />
          </div>

          <div>
            <label for="minute" class="field-label">Menit</label>
            <input
              id="minute"
              v-model="minuteInput"
              type="number"
              inputmode="numeric"
              min="1"
              max="120"
              placeholder="cth. 67"
              class="field"
              @blur="clampMinute"
            />
            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="value in INJURY_TIMES"
                :key="value"
                type="button"
                class="rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
                :class="
                  minute === value
                    ? 'border-brand-500/70 bg-brand-500/20 text-brand-400'
                    : 'border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white'
                "
                @click="pickMinute(value)"
              >
                {{ value }}′
              </button>
            </div>
            <p class="mt-2 text-xs text-white/40">Menit berapa pun dari 1 sampai 120.</p>
          </div>

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="-translate-y-1 opacity-0"
            leave-active-class="transition duration-150 ease-in"
            leave-to-class="-translate-y-1 opacity-0"
          >
            <div v-if="isInjuryTime">
              <label for="additional" class="field-label">Tambahan waktu (opsional)</label>
              <div class="relative">
                <span
                  class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg text-brand-500"
                >
                  +
                </span>
                <input
                  id="additional"
                  v-model="additionalInput"
                  type="number"
                  inputmode="numeric"
                  min="0"
                  max="30"
                  placeholder="0"
                  class="field pl-9"
                  @blur="clampAdditional"
                />
              </div>
              <p class="mt-2 text-xs text-white/40">
                Contoh: <span class="text-white/70">{{ minute }}′ +2</span> untuk injury time.
                Biarkan kosong untuk <span class="text-white/70">{{ minute }}′</span> biasa.
              </p>
            </div>
          </Transition>

          <div class="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3">
            <p class="text-xs uppercase tracking-[0.2em] text-white/40">Pratinjau menit</p>
            <p class="font-display text-3xl text-white">{{ timePreview }}</p>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              class="btn-brand flex-1"
              :disabled="!canGenerate"
              @click="generate"
            >
              <svg
                v-if="!isGenerating"
                viewBox="0 0 24 24"
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M5 12l4 4L19 6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <span
                v-else
                class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              />
              {{ isGenerating ? 'Membuat…' : 'Buat kartu' }}
            </button>
            <button type="button" class="btn-ghost sm:w-auto" @click="reset">Atur ulang</button>
          </div>

          <div v-if="isGenerating || progress > 0" class="space-y-2">
            <div class="flex items-center justify-between text-xs text-white/50">
              <span>{{ isGenerating ? 'Merender kartu…' : 'Selesai' }}</span>
              <span>{{ Math.round(progress) }}%</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                class="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-200 ease-out"
                :style="{ width: `${progress}%` }"
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="font-display text-2xl uppercase tracking-wide">Pratinjau &amp; unduh</h2>
            <p class="text-sm text-white/45">
              Kedua format dibuat di browser Anda. Ekspor sebagai PNG atau WebP.
            </p>
          </div>
        </div>

        <div class="grid items-start gap-6 xl:grid-cols-2">
          <CardResult format="vertical" :data="cardData" />
          <CardResult format="square" :data="cardData" />
        </div>
      </section>
    </div>
  </div>
</template>
