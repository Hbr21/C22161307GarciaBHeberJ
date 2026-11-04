<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

const dialogRef = ref(null)

function onKeyDown(e) {
  if (e.key === 'Escape' && !props.busy) {
    emit('close')
  }
}

function onOverlayClick(e) {
  if (e.target === e.currentTarget && !props.busy) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  document.body.style.overflow = ''
})

defineExpose({
  close: () => emit('close'),
})
</script>

<template>
  <div class="modal-overlay" @mousedown="onOverlayClick">
    <div
      ref="dialogRef"
      class="modal-dialog"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
    >
      <div class="modal-header">
        <h3>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M3 9h18" />
            <path d="M9 21V9" />
          </svg>
          {{ title }}
        </h3>
        <button
          type="button"
          class="modal-close-btn"
          :disabled="busy"
          aria-label="Cerrar ventana"
          @click="emit('close')"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <slot />
    </div>
  </div>
</template>
