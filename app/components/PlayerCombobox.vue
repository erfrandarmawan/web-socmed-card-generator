<script setup lang="ts">
import type { Player } from '~/types'

const props = defineProps<{
  modelValue: Player | null
  players: Player[]
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: Player | null): void
}>()

const query = ref('')
const open = ref(false)
const activeIndex = ref(0)
const root = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement | null>(null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.players.slice(0, 60)
  return props.players
    .filter(
      (player) =>
        player.name.toLowerCase().includes(q) ||
        player.team.toLowerCase().includes(q) ||
        player.country.toLowerCase().includes(q),
    )
    .slice(0, 60)
})

watch(open, (isOpen) => {
  if (isOpen) activeIndex.value = 0
})

watch(filtered, () => {
  activeIndex.value = 0
})

function select(player: Player) {
  emit('update:modelValue', player)
  query.value = ''
  open.value = false
}

function clear() {
  emit('update:modelValue', null)
  query.value = ''
  nextTick(() => input.value?.focus())
}

function move(delta: number) {
  if (!filtered.value.length) return
  const next = activeIndex.value + delta
  if (next < 0) activeIndex.value = filtered.value.length - 1
  else if (next >= filtered.value.length) activeIndex.value = 0
  else activeIndex.value = next
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    open.value = true
    move(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    open.value = true
    move(-1)
  } else if (event.key === 'Enter') {
    if (open.value && filtered.value[activeIndex.value]) {
      event.preventDefault()
      select(filtered.value[activeIndex.value]!)
    }
  } else if (event.key === 'Escape') {
    open.value = false
  }
}

function onFocus() {
  open.value = true
}

function onClickOutside(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div ref="root" class="relative">
    <div
      v-if="modelValue"
      class="flex items-center gap-3 rounded-xl border border-volt-500/40 bg-volt-500/[0.07] px-3 py-2.5"
    >
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-ink-950"
        :style="{
          backgroundImage: `linear-gradient(135deg, ${avatarGradient(modelValue.id)[0]}, ${avatarGradient(modelValue.id)[1]})`,
        }"
      >
        {{ initials(modelValue.name) }}
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-white">{{ modelValue.name }}</p>
        <p class="truncate text-xs text-white/50">
          {{ modelValue.team }} &middot; #{{ modelValue.number }}
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
        aria-label="Clear selected player"
        @click="clear"
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <template v-else>
      <div class="relative">
        <svg
          viewBox="0 0 24 24"
          class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" stroke-linecap="round" />
        </svg>
        <input
          ref="input"
          v-model="query"
          type="text"
          class="field pl-10"
          placeholder="Search player, club, or country..."
          autocomplete="off"
          role="combobox"
          :aria-expanded="open"
          aria-controls="player-listbox"
          @focus="onFocus"
          @keydown="onKeydown"
        />
      </div>

      <div
        v-if="open"
        class="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-ink-800/95 p-1.5 shadow-2xl shadow-black/50 backdrop-blur"
      >
        <p v-if="!filtered.length" class="px-3 py-4 text-sm text-white/50">
          No players found matching that search.
        </p>
        <ul v-else id="player-listbox" role="listbox" class="space-y-0.5">
          <li
            v-for="(player, index) in filtered"
            :key="player.id"
            role="option"
            :aria-selected="index === activeIndex"
            class="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition"
            :class="index === activeIndex ? 'bg-volt-500/15' : 'hover:bg-white/[0.06]'"
            @mouseenter="activeIndex = index"
            @mousedown.prevent="select(player)"
          >
            <span
              class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-ink-950"
              :style="{
                backgroundImage: `linear-gradient(135deg, ${avatarGradient(player.id)[0]}, ${avatarGradient(player.id)[1]})`,
              }"
            >
              {{ initials(player.name) }}
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate text-sm font-medium text-white">{{ player.name }}</span>
              <span class="block truncate text-xs text-white/45">
                {{ player.team }} &middot; {{ player.position }}
              </span>
            </span>
            <span class="shrink-0 text-xs font-semibold text-white/35">#{{ player.number }}</span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
