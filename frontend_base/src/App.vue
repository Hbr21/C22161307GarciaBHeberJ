<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import CrudView from '@/components/CrudView.vue'
import { RESOURCES } from '@/resources'
import { checkBackendHealth } from '@/api/client'

function sectionFromHash() {
  const section = location.hash.slice(1)
  return Object.hasOwn(RESOURCES, section) ? section : 'roles'
}

const section = ref(sectionFromHash())
const resource = computed(() => RESOURCES[section.value])

function onHashChange() {
  section.value = sectionFromHash()
}

// Tema Claro / Oscuro
const theme = ref(localStorage.getItem('bfs_theme') || 'light')

function toggleTheme() {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme.value)
  localStorage.setItem('bfs_theme', theme.value)
}

// Monitor de salud del backend
const backendOnline = ref(true)
const checkingHealth = ref(false)
let healthInterval

async function pingBackend() {
  checkingHealth.value = true
  const res = await checkBackendHealth()
  backendOnline.value = res.ok
  checkingHealth.value = false
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)
  window.addEventListener('hashchange', onHashChange)
  pingBackend()
  healthInterval = setInterval(pingBackend, 15000)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', onHashChange)
  clearInterval(healthInterval)
})
</script>

<template>
  <div class="app-container">
    <!-- Header Superior -->
    <header class="top-header">
      <div class="brand-section">
        <div class="brand-logo">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="brand-text">
          <h1>BFS Manager &middot; Plataforma de Control</h1>
          <p>Microservicios REST con NodeJS, Express y PostgreSQL</p>
        </div>
      </div>

      <div class="header-right">
        <!-- Credencial de Estudiante -->
        <div class="student-badge" title="Estudiante / Número de Control">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span>C22161307 &middot; Garcia B. Heber J.</span>
        </div>

        <!-- Indicador de Backend en Vivo -->
        <button
          type="button"
          class="health-status-badge"
          :class="backendOnline ? 'online' : 'offline'"
          :title="backendOnline ? 'Servidor conectado (puerto 3000). Haz clic para probar.' : 'No se detecta el servidor backend. Haz clic para reintentar.'"
          @click="pingBackend"
        >
          <span class="pulse-dot"></span>
          <span>{{ backendOnline ? 'API Conectada' : 'Backend Offline' }}</span>
        </button>

        <!-- Conmutador de Modo Oscuro / Claro -->
        <button
          type="button"
          class="btn-icon-toggle"
          :title="theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'"
          @click="toggleTheme"
        >
          <svg v-if="theme === 'light'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Navegación por Módulos -->
    <nav class="tabs-nav" aria-label="Secciones del Sistema">
      <a
        v-for="(item, key) in RESOURCES"
        :key="key"
        :href="`#${key}`"
        class="tab-btn"
        :class="{ active: section === key }"
      >
        <!-- Icono para Roles -->
        <svg v-if="item.icon === 'shield'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>

        <!-- Icono para Usuarios -->
        <svg v-else-if="item.icon === 'users'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>

        <!-- Icono para Empleados -->
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>

        <span>{{ item.label }}</span>
      </a>
    </nav>

    <!-- Vista Dinámica del CRUD -->
    <main>
      <CrudView :key="section" :resource="resource" />
    </main>
  </div>
</template>
