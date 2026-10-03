<template>
  <div class="flex min-h-screen flex-col">
    <NuxtLoadingIndicator color="#C8FF2F" :height="3" />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <footer class="border-t border-white/5 py-6">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-white/35 sm:flex-row sm:px-6 lg:px-8"
      >
        <p>Goal Card Generator — every image is rendered locally on your device.</p>
        <p>Built with Nuxt 4 · SPA</p>
      </div>
    </footer>
  </div>
</template>
