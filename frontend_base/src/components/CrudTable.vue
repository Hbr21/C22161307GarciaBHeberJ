<script setup>
defineProps({
  resource: { type: Object, required: true },
  rows: { type: Array, required: true },
  cellText: { type: Function, required: true },
})
defineEmits(['edit', 'delete'])

function getInitials(text) {
  if (!text) return '?'
  const parts = String(text).trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return text.slice(0, 2).toUpperCase()
}

function getAvatarColor(id) {
  const gradients = [
    'linear-gradient(135deg, #6366f1, #8b5cf6)',
    'linear-gradient(135deg, #0ea5e9, #2563eb)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #ec4899, #be185d)',
    'linear-gradient(135deg, #8b5cf6, #d946ef)',
  ]
  const index = (Number(id) || 0) % gradients.length
  return gradients[index]
}
</script>

<template>
  <div class="table-responsive">
    <table class="modern-table">
      <thead>
        <tr>
          <th v-for="column in resource.columns" :key="column.key" scope="col" :style="column.width ? { width: column.width } : null">
            {{ column.label }}
          </th>
          <th scope="col" style="text-align: right; width: 140px;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td v-for="column in resource.columns" :key="column.key">
            <!-- ID badge -->
            <span v-if="column.key === 'id'" class="cell-id-badge">
              #{{ row.id }}
            </span>

            <!-- Usuario con avatar -->
            <div v-else-if="column.isUser" class="user-cell">
              <div class="avatar-circle" :style="{ background: getAvatarColor(row.id) }">
                {{ getInitials(row.username) }}
              </div>
              <div class="user-cell-meta">
                <span class="primary-text">{{ row.username }}</span>
              </div>
            </div>

            <!-- Empleado con avatar -->
            <div v-else-if="column.isEmployee" class="user-cell">
              <div class="avatar-circle" :style="{ background: getAvatarColor(row.id) }">
                {{ getInitials(`${row.first_name} ${row.last_name}`) }}
              </div>
              <div class="user-cell-meta">
                <span class="primary-text">{{ row.first_name }} {{ row.last_name }}</span>
              </div>
            </div>

            <!-- Badge de Rol -->
            <span v-else-if="column.isRole" class="role-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              {{ cellText(row, column) }}
            </span>

            <!-- Badge de Usuario asociado -->
            <span v-else-if="column.isUserBadge" class="cell-id-badge" style="font-weight: 500;">
              @{{ cellText(row, column) }}
            </span>

            <!-- Badge de Estado (Activo / Inactivo) -->
            <span
              v-else-if="column.isStatus"
              class="status-badge"
              :class="row.is_active ? 'active' : 'inactive'"
            >
              <span class="status-indicator-dot"></span>
              {{ row.is_active ? 'Activo' : 'Inactivo' }}
            </span>

            <!-- Texto regular -->
            <span v-else-if="cellText(row, column)">
              {{ cellText(row, column) }}
            </span>

            <!-- Placeholder vacío -->
            <span v-else class="text-subtle" style="color: var(--text-subtle); font-size: 0.82rem;">
              {{ column.empty ?? '—' }}
            </span>
          </td>

          <!-- Columna de Acciones -->
          <td>
            <div class="row-actions-group">
              <button
                type="button"
                class="btn btn-secondary btn-small"
                title="Editar este registro"
                :aria-label="`Editar ${resource.displayName(row)}`"
                @click="$emit('edit', row)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
                Editar
              </button>

              <button
                type="button"
                class="btn btn-danger-outline btn-small"
                title="Eliminar este registro"
                :aria-label="`Eliminar ${resource.displayName(row)}`"
                @click="$emit('delete', row)"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
                Eliminar
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
