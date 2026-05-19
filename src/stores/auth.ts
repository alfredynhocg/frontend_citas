import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export interface AuthUser {
  id: number
  name: string
  email: string
  role: 'admin' | 'couple' | 'guest'
  is_active: boolean
  created_at: string
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<AuthUser | null>(null)
    const accessToken = ref<string | null>(null)
    const refreshToken = ref<string | null>(null)
    const sessionExpired = ref(false)

    const isAuthenticated = computed(() => !!accessToken.value)
    // Acepta tanto el campo nuevo (role) como el viejo (rol_id) por compatibilidad con sesiones persistidas
    const isAdmin = computed(() =>
      user.value?.role === 'admin' || (user.value as any)?.rol_id === 1
    )

    async function login(email: string, password: string) {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Credenciales incorrectas')
      }
      const data = await res.json()
      accessToken.value = data.access_token
      refreshToken.value = data.refresh_token
      user.value = data.user
      sessionExpired.value = false
    }

    async function register(name: string, email: string, password: string) {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message ?? 'Error al registrar')
      }
      const data = await res.json()
      accessToken.value = data.access_token
      refreshToken.value = data.refresh_token
      user.value = data.user
      sessionExpired.value = false
    }

    async function fetchMe() {
      if (!accessToken.value) return
      const res = await fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      })
      if (!res.ok) { logout(true); return }
      user.value = await res.json()
    }

    async function refresh() {
      if (!refreshToken.value) { logout(true); return }
      const res = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${refreshToken.value}` },
      })
      if (!res.ok) { logout(true); return }
      const data = await res.json()
      accessToken.value = data.access_token
    }

    // Fetch con renovación automática de token al 401
    async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
      const headers = new Headers(options.headers)
      headers.set('Authorization', `Bearer ${accessToken.value}`)
      if (!(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json')
      }

      let res = await fetch(url, { ...options, headers })

      if (res.status === 401 && refreshToken.value) {
        await refresh()
        if (!accessToken.value) throw new Error('Sesión expirada')
        headers.set('Authorization', `Bearer ${accessToken.value}`)
        res = await fetch(url, { ...options, headers })
      }

      if (res.status === 401) {
        logout(true)
        throw new Error('Sesión expirada')
      }

      return res
    }

    function logout(expired = false) {
      user.value = null
      accessToken.value = null
      refreshToken.value = null
      sessionExpired.value = expired
      window.location.href = expired
        ? '/mordern-auth/login?expired=1'
        : '/mordern-auth/login'
    }

    return {
      user,
      accessToken,
      refreshToken,
      sessionExpired,
      isAuthenticated,
      isAdmin,
      login,
      register,
      fetchMe,
      refresh,
      authFetch,
      logout,
    }
  },
  { persist: true },
)
