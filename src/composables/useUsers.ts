import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

export interface UserItem {
  id: number
  name: string
  email: string
  role: 'admin' | 'couple' | 'guest'
  is_active: boolean
  created_at: string
}

export interface UserPage {
  items: UserItem[]
  total: number
  page: number
  pages: number
  per_page: number
}

export interface UpdateUserPayload {
  name?: string
  email?: string
  role?: string
  rol_id?: number
  is_active?: boolean
  password?: string
}

export function useUsers() {
  const auth = useAuthStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  function headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.accessToken}`,
    }
  }

  async function fetchUsers(params: {
    page?: number
    per_page?: number
    role?: string
  } = {}): Promise<UserPage> {
    loading.value = true
    error.value = null
    try {
      const qs = new URLSearchParams()
      if (params.page)     qs.set('page', String(params.page))
      if (params.per_page) qs.set('per_page', String(params.per_page))
      if (params.role)     qs.set('role', params.role)
      const res = await fetch(`${API}/users/?${qs}`, { headers: headers() })
      if (!res.ok) throw new Error((await res.json()).message)
      return await res.json()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar usuarios'
      return { items: [], total: 0, page: 1, pages: 1, per_page: 20 }
    } finally {
      loading.value = false
    }
  }

  async function fetchUser(id: number): Promise<UserItem | null> {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API}/users/${id}`, { headers: headers() })
      if (!res.ok) throw new Error((await res.json()).message)
      return await res.json()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al cargar usuario'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateUser(id: number, payload: UpdateUserPayload): Promise<UserItem | null> {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API}/users/${id}`, {
        method: 'PATCH',
        headers: headers(),
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error((await res.json()).message)
      return await res.json()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al actualizar'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteUser(id: number): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`${API}/users/${id}`, {
        method: 'DELETE',
        headers: headers(),
      })
      if (!res.ok) throw new Error((await res.json()).message)
      return true
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Error al eliminar'
      return false
    } finally {
      loading.value = false
    }
  }

  return { loading, error, fetchUsers, fetchUser, updateUser, deleteUser }
}
