<script setup>
import { computed, reactive, ref } from 'vue'
import BaseDialog from './BaseDialog.vue'

const props = defineProps({
  resource: { type: Object, required: true },
  row: { type: Object, default: null },
  lookups: { type: Object, required: true },
})
const emit = defineEmits(['saved', 'missing', 'close'])

const dialog = ref(null)
const saving = ref(false)
const errorMessage = ref('')

const fields = computed(() =>
  props.resource.fields.filter((field) => props.row || !field.editOnly),
)

const values = reactive(
  Object.fromEntries(
    props.resource.fields.map((field) => [
      field.key,
      props.row?.[field.key] ?? (field.type === 'checkbox' ? true : ''),
    ]),
  ),
)

function isRequired(field) {
  return field.required === true || (field.required === 'create' && !props.row)
}

const isEmpty = (value) => typeof value === 'string' && !value.trim()

const canSave = computed(() =>
  fields.value.every((field) => !isRequired(field) || !isEmpty(values[field.key])),
)

function buildPayload() {
  const payload = {}
  for (const field of fields.value) {
    const value = values[field.key]
    if (isEmpty(value)) {
      if (field.whenEmpty !== 'omit') payload[field.key] = null
    } else if (typeof value === 'string' && field.type !== 'password') {
      payload[field.key] = value.trim()
    } else {
      payload[field.key] = value
    }
  }
  return payload
}

async function submit() {
  if (saving.value || !canSave.value) return
  errorMessage.value = ''
  saving.value = true
  try {
    const { api } = props.resource
    const payload = buildPayload()
    const result = props.row
      ? await api.update(props.row.id, payload)
      : await api.create(payload)
    emit('saved', result)
    saving.value = false
    dialog.value.close()
  } catch (error) {
    saving.value = false
    errorMessage.value = error.message
    if (error.status === 404) emit('missing')
  }
}
</script>

<template>
  <BaseDialog
    ref="dialog"
    :title="row ? `Editar ${resource.singular} #${row.id}` : `Registrar nuevo ${resource.singular}`"
    :busy="saving"
    @close="emit('close')"
  >
    <form novalidate @submit.prevent="submit">
      <div class="modal-body">
        <div v-if="errorMessage" class="alert alert-error" role="alert" style="margin: 0 0 1.25rem 0;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <template v-for="field in fields" :key="field.key">
          <!-- Toggle switch para booleanos / checkboxes -->
          <div
            v-if="field.type === 'checkbox'"
            class="form-group"
          >
            <div
              class="toggle-switch-wrapper"
              @click="values[field.key] = !values[field.key]"
            >
              <div class="toggle-switch-text">
                <div class="label">{{ field.label }}</div>
                <div class="desc">{{ field.description || 'Habilita o deshabilita este registro.' }}</div>
              </div>
              <div class="switch-control" :class="{ checked: values[field.key] }">
                <div class="switch-thumb"></div>
              </div>
            </div>
          </div>

          <!-- Campos normales -->
          <div v-else class="form-group">
            <label :for="`field-${field.key}`">
              {{ field.label }}
              <span v-if="!isRequired(field)" class="label-optional">(opcional)</span>
              <span v-else style="color: var(--danger);">*</span>
            </label>

            <!-- Textarea -->
            <textarea
              v-if="field.type === 'textarea'"
              :id="`field-${field.key}`"
              v-model="values[field.key]"
              class="form-control"
              rows="3"
              :placeholder="field.placeholder || ''"
            ></textarea>

            <!-- Select -->
            <select
              v-else-if="field.type === 'select'"
              :id="`field-${field.key}`"
              v-model="values[field.key]"
              class="form-control"
            >
              <option value="" disabled>Selecciona una opción...</option>
              <option
                v-for="option in field.options(lookups)"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>

            <!-- Input text/email/password/date -->
            <input
              v-else
              :id="`field-${field.key}`"
              v-model="values[field.key]"
              class="form-control"
              :type="field.type ?? 'text'"
              :placeholder="field.placeholder || ''"
              :autocomplete="field.type === 'password' ? 'new-password' : 'off'"
            />

            <!-- Pistas de edición / ayuda -->
            <p v-if="row && field.editHint" class="field-help-text">
              💡 {{ field.editHint }}
            </p>
            <p
              v-if="field.emptyHint && field.options(lookups).length === 0"
              class="field-help-text"
              style="color: var(--warning-text);"
            >
              ⚠️ {{ field.emptyHint }}
            </p>
          </div>
        </template>
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          :disabled="saving"
          @click="dialog.close()"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="btn btn-primary"
          :disabled="saving || !canSave"
        >
          <span v-if="saving" class="spinner"></span>
          {{ saving ? 'Guardando...' : row ? 'Actualizar Registro' : 'Crear Registro' }}
        </button>
      </div>
    </form>
  </BaseDialog>
</template>
