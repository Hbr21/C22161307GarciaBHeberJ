<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CrudDeleteDialog from './CrudDeleteDialog.vue'
import CrudFormDialog from './CrudFormDialog.vue'
import CrudTable from './CrudTable.vue'

const props = defineProps({
  resource: { type: Object, required: true },
})

// Listado de datos
const rows = ref([])
const lookups = ref({})
const loading = ref(true)
const loadError = ref('')
let lastRequest = 0

// Filtro de estado rápido (todos, activos, inactivos)
const statusFilter = ref('all') // 'all' | 'active' | 'inactive'

async function load() {
  const request = ++lastRequest
  loading.value = true
  try {
    const lookupNames = Object.keys(props.resource.lookups)
    const [data, ...lists] = await Promise.all([
      props.resource.api.list(),
      ...lookupNames.map((name) => props.resource.lookups[name]()),
    ])
    if (request !== lastRequest) return
    lookups.value = Object.fromEntries(lookupNames.map((name, index) => [name, lists[index]]))
    rows.value = data || []
    loadError.value = ''
  } catch (error) {
    if (request === lastRequest) loadError.value = error.message
  } finally {
    if (request === lastRequest) loading.value = false
  }
}

onMounted(load)

// Métricas de conteo
const totalCount = computed(() => rows.value.length)
const activeCount = computed(() => rows.value.filter((r) => r.is_active === true).length)
const inactiveCount = computed(() => rows.value.filter((r) => r.is_active === false).length)

// Búsqueda inteligente (soporta múltiples términos separados por comas)
const search = ref('')

function normalize(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
}

const searchTerms = computed(() =>
  normalize(search.value)
    .split(',')
    .map((term) => term.trim())
    .filter(Boolean),
)

function cellText(row, column) {
  return column.value ? column.value(row, lookups.value) : row[column.key]
}

function matches(row, term) {
  return props.resource.columns.some((column) =>
    column.key === 'id'
      ? String(row.id) === term
      : normalize(cellText(row, column)).includes(term),
  )
}

const visibleRows = computed(() => {
  let list = rows.value

  // Filtro de estado si la entidad tiene `is_active`
  if (statusFilter.value === 'active') {
    list = list.filter((r) => r.is_active === true)
  } else if (statusFilter.value === 'inactive') {
    list = list.filter((r) => r.is_active === false)
  }

  // Filtro de términos de búsqueda
  if (searchTerms.value.length === 0) return list
  return list.filter((row) => searchTerms.value.some((term) => matches(row, term)))
})

// Diálogos de CRUD
const formDialog = ref(null) // { row: objeto | null }
const rowToDelete = ref(null)

function onChanged({ message }) {
  showToast(message || 'Operación completada exitosamente', 'success')
  load()
}

// Avisos flotantes (Toast)
const toast = ref({ text: '', type: 'success' })
let toastTimer

function showToast(text, type = 'success') {
  toast.value = { text, type }
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toast.value = { text: '', type: 'success' }
  }, 4000)
}

onBeforeUnmount(() => clearTimeout(toastTimer))
</script>

<template>
  <div>
    <!-- Tarjetas de Métricas (KPIs) -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-info">
          <h3>Total Registrados</h3>
          <div class="metric-value">{{ totalCount }}</div>
        </div>
        <div class="metric-icon-box">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-info">
          <h3>Registros Activos</h3>
          <div class="metric-value">{{ activeCount }}</div>
        </div>
        <div class="metric-icon-box success">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-info">
          <h3>Registros Inactivos</h3>
          <div class="metric-value">{{ inactiveCount }}</div>
        </div>
        <div class="metric-icon-box warning">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Contenedor Principal con Toolbar y Tabla -->
    <div class="main-card">
      <div class="card-toolbar">
        <div class="section-title-wrap">
          <h2>
            {{ resource.label }}
            <span class="tab-badge">{{ totalCount }}</span>
          </h2>
          <p>{{ resource.subtitle }}</p>
        </div>

        <div class="toolbar-actions">
          <!-- Buscador -->
          <div class="search-box-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="search"
              v-model="search"
              type="search"
              class="search-input"
              autocomplete="off"
              :placeholder="`Buscar por ID o dato...`"
            />
            <button
              v-if="search"
              type="button"
              class="search-clear-btn"
              title="Limpiar búsqueda"
              @click="search = ''"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <!-- Botón Recargar -->
          <button
            type="button"
            class="btn btn-secondary btn-icon"
            title="Recargar datos"
            :disabled="loading"
            @click="load"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinner: loading }">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 21h5v-5"/>
            </svg>
          </button>

          <!-- Botón Nuevo Registro -->
          <button
            type="button"
            class="btn btn-primary"
            @click="formDialog = { row: null }"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo {{ resource.singular }}
          </button>
        </div>
      </div>

      <!-- Alerta de Error de Carga -->
      <div v-if="loadError" class="alert alert-error alert-row" role="alert">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ loadError }}</span>
        </div>
        <button type="button" class="btn btn-secondary btn-small" @click="load">Reintentar</button>
      </div>

      <!-- Estado: Cargando inicial -->
      <div v-if="loading && rows.length === 0" class="empty-state-box">
        <div class="empty-icon-circle">
          <div class="spinner" style="width: 28px; height: 28px; border-width: 3px; color: var(--primary);"></div>
        </div>
        <h3>Cargando registros...</h3>
        <p>Consultando base de datos PostgreSQL...</p>
      </div>

      <!-- Estado: Sin registros en la base de datos -->
      <div v-else-if="rows.length === 0 && !loadError" class="empty-state-box">
        <div class="empty-icon-circle">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
        </div>
        <h3>No hay {{ resource.plural }} registrados</h3>
        <p>Aún no existe ningún registro en la base de datos para esta sección. Puedes comenzar creando el primero.</p>
        <button type="button" class="btn btn-primary" @click="formDialog = { row: null }">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Crear primer {{ resource.singular }}
        </button>
      </div>

      <!-- Estado: Con registros -->
      <template v-else-if="rows.length > 0">
        <!-- Indicador de filtro / búsqueda activa -->
        <div v-if="searchTerms.length > 0" style="padding: 0.6rem 1.5rem; background: var(--surface-muted); font-size: 0.8rem; color: var(--text-muted); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
          <span>
            Mostrando <strong>{{ visibleRows.length }}</strong> de <strong>{{ rows.length }}</strong> {{ resource.plural }} para «{{ search.trim() }}»
          </span>
          <button type="button" class="btn btn-small btn-secondary" style="padding: 0.2rem 0.5rem;" @click="search = ''">
            Restablecer búsqueda
          </button>
        </div>

        <!-- Tabla -->
        <CrudTable
          v-if="visibleRows.length > 0"
          :resource="resource"
          :rows="visibleRows"
          :cell-text="cellText"
          @edit="formDialog = { row: $event }"
          @delete="rowToDelete = $event"
        />

        <!-- Estado sin coincidencias en búsqueda -->
        <div v-else class="empty-state-box">
          <div class="empty-icon-circle">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
          <h3>Sin resultados</h3>
          <p>No se encontró ningún registro que coincida con «{{ search.trim() }}».</p>
          <button type="button" class="btn btn-secondary btn-small" @click="search = ''">
            Limpiar búsqueda
          </button>
        </div>
      </template>
    </div>

    <!-- Modales -->
    <CrudFormDialog
      v-if="formDialog"
      :resource="resource"
      :row="formDialog.row"
      :lookups="lookups"
      @saved="onChanged"
      @missing="load"
      @close="formDialog = null"
    />

    <CrudDeleteDialog
      v-if="rowToDelete"
      :resource="resource"
      :row="rowToDelete"
      @deleted="onChanged"
      @missing="load"
      @close="rowToDelete = null"
    />

    <!-- Notificaciones Toast -->
    <div class="toast-container">
      <div
        v-if="toast.text"
        class="toast-item"
        :class="toast.type"
      >
        <svg v-if="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--success)" stroke-width="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ toast.text }}</span>
      </div>
    </div>
  </div>
</template>
