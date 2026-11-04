<script setup>
import { ref } from 'vue'
import BaseDialog from './BaseDialog.vue'

const props = defineProps({
  resource: { type: Object, required: true },
  row: { type: Object, required: true },
})
const emit = defineEmits(['deleted', 'missing', 'close'])

const dialog = ref(null)
const deleting = ref(false)
const errorMessage = ref('')

async function confirmDelete() {
  if (deleting.value) return
  deleting.value = true
  errorMessage.value = ''
  try {
    const result = await props.resource.api.remove(props.row.id)
    emit('deleted', result)
    deleting.value = false
    dialog.value.close()
  } catch (error) {
    deleting.value = false
    errorMessage.value = error.message
    if (error.status === 404) emit('missing')
  }
}
</script>

<template>
  <BaseDialog
    ref="dialog"
    :title="`Eliminar ${resource.singular}`"
    :busy="deleting"
    @close="emit('close')"
  >
    <div class="modal-body" style="text-align: center; padding: 2rem 1.5rem;">
      <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--danger-soft); color: var(--danger); display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>

      <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem;">
        ¿Estás seguro de eliminar este registro?
      </h4>

      <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem;">
        Se eliminará el {{ resource.singular }}:
      </p>

      <div style="display: inline-block; padding: 0.4rem 1rem; border-radius: var(--radius-md); background: var(--surface-muted); border: 1px solid var(--border); font-weight: 600; color: var(--text-main); margin-bottom: 1.25rem;">
        {{ resource.displayName(row) }} (ID #{{ row.id }})
      </div>

      <p style="color: var(--danger-text); font-size: 0.82rem; font-weight: 500;">
        ⚠️ Esta acción es irreversible y eliminará los datos de PostgreSQL.
      </p>

      <div v-if="errorMessage" class="alert alert-error" role="alert" style="margin: 1.25rem 0 0 0; text-align: left;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <div class="modal-footer" style="justify-content: center; gap: 1rem;">
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="deleting"
        @click="dialog.close()"
      >
        Cancelar
      </button>
      <button
        type="button"
        class="btn btn-danger"
        :disabled="deleting"
        @click="confirmDelete"
      >
        <span v-if="deleting" class="spinner"></span>
        {{ deleting ? 'Eliminando...' : 'Sí, eliminar registro' }}
      </button>
    </div>
  </BaseDialog>
</template>
