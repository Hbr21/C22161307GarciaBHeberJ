const API_URL = import.meta.env.VITE_API_URL || '/api/v2'
const HEALTH_URL = '/api/v1/health'
const CONNECTION_ERROR =
  'No se pudo conectar con el servidor. Verifica que el backend esté en ejecución en el puerto 3000.'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(url, { method = 'GET', data } = {}) {
  let response
  try {
    response = await fetch(url, {
      method,
      headers: data ? { 'Content-Type': 'application/json' } : undefined,
      body: data ? JSON.stringify(data) : undefined,
    })
  } catch {
    throw new ApiError(CONNECTION_ERROR, 0)
  }

  // Si el backend está apagado o falla el proxy de Vite
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(body?.message || body?.error || CONNECTION_ERROR, response.status)
  }
  return body
}

export function createResourceApi(path) {
  const url = `${API_URL}/${path}`
  return {
    list: async () => (await request(url)).data,
    getById: async (id) => (await request(`${url}/${id}`)).data,
    create: (data) => request(url, { method: 'POST', data }),
    update: (id, data) => request(`${url}/${id}`, { method: 'PUT', data }),
    remove: (id) => request(`${url}/${id}`, { method: 'DELETE' }),
  }
}

export async function checkBackendHealth() {
  try {
    const res = await fetch(HEALTH_URL)
    if (res.ok) {
      const data = await res.json().catch(() => ({}))
      return { ok: true, data }
    }
    return { ok: false, status: res.status }
  } catch {
    return { ok: false, status: 0 }
  }
}
