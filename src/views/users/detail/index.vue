<template>
  <Vertical>
    <div class="p-4 sm:p-6 space-y-6">

      <div class="flex items-center gap-2 text-sm text-default-400">
        <router-link to="/users/list" class="hover:text-rose-500 transition-colors flex items-center gap-1">
          <Icon icon="lucide:users" class="size-3.5" />
          Usuarios
        </router-link>
        <Icon icon="lucide:chevron-right" class="size-3.5" />
        <span class="text-default-700 font-medium">{{ user?.name ?? '…' }}</span>
      </div>

      <div v-if="loading && !user" class="flex justify-center py-20">
        <Icon icon="lucide:loader-circle" class="size-10 animate-spin text-rose-400" />
      </div>

      <div v-else-if="!user" class="card p-12 text-center space-y-3">
        <div class="size-16 rounded-full bg-default-100 flex items-center justify-center mx-auto">
          <Icon icon="lucide:user-x" class="size-8 text-default-300" />
        </div>
        <p class="font-semibold text-default-700">Usuario no encontrado</p>
        <router-link to="/users/list" class="text-sm text-rose-500 hover:underline">
          Volver al listado
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div class="card p-6 text-center space-y-4 lg:col-span-1">
          <div class="size-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto"
            :class="avatarColor(user.role)">
            {{ initials(user.name) }}
          </div>
          <div>
            <p class="font-bold text-default-900 text-lg">{{ user.name }}</p>
            <p class="text-sm text-default-400">{{ user.email }}</p>
          </div>
          <div class="flex gap-2 justify-center flex-wrap">
            <span :class="roleBadgeClass(user.role)"
              class="text-xs font-semibold px-3 py-1 rounded-full">
              {{ roleLabel(user.role) }}
            </span>
            <span :class="user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
              class="text-xs font-semibold px-3 py-1 rounded-full">
              {{ user.is_active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <p class="text-xs text-default-400 flex items-center justify-center gap-1.5">
            <Icon icon="lucide:calendar" class="size-3.5" />
            Registrado el {{ formatDate(user.created_at) }}
          </p>
          <router-link to="/users/list"
            class="w-full flex items-center justify-center gap-2 border border-default-200 rounded-xl py-2.5 text-sm text-default-600 hover:bg-default-50 transition-colors">
            <Icon icon="lucide:arrow-left" class="size-4" />
            Volver al listado
          </router-link>
        </div>

        <div class="card lg:col-span-2">
          <div class="p-5 border-b border-default-100">
            <h2 class="font-bold text-default-900">Editar información</h2>
          </div>
          <div class="p-5">
            <form class="space-y-5" @submit.prevent="save">

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-medium text-default-600 mb-1 block">Nombre completo</label>
                  <input v-model="form.name" type="text" required
                    class="w-full border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                </div>
                <div>
                  <label class="text-xs font-medium text-default-600 mb-1 block">Email</label>
                  <input v-model="form.email" type="email" required
                    class="w-full border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-medium text-default-600 mb-1 block">Rol</label>
                  <select v-model="form.rol_id"
                    class="w-full border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
                    <option v-for="r in rolesDisponibles" :key="r.id" :value="r.id">
                      {{ r.nombre }}
                    </option>
                  </select>
                </div>
                <div class="flex flex-col justify-center">
                  <label class="text-xs font-medium text-default-600 mb-2 block">Estado de la cuenta</label>
                  <label class="flex items-center gap-3 cursor-pointer">
                    <button type="button" @click="form.is_active = !form.is_active"
                      class="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                      :class="form.is_active ? 'bg-rose-500' : 'bg-default-200'">
                      <span class="absolute top-0.5 size-5 bg-white rounded-full shadow transition-transform"
                        :class="form.is_active ? 'left-[22px]' : 'left-0.5'" />
                    </button>
                    <span class="text-sm" :class="form.is_active ? 'text-default-900 font-medium' : 'text-default-400'">
                      {{ form.is_active ? 'Activa' : 'Inactiva' }}
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label class="text-xs font-medium text-default-600 mb-1 block">
                  Nueva contraseña <span class="text-default-300 font-normal">(dejar vacío para no cambiar)</span>
                </label>
                <input v-model="form.password" type="password" placeholder="Mínimo 8 caracteres"
                  autocomplete="new-password"
                  class="w-full border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
              </div>

              <div v-if="saveError"
                class="flex items-start gap-2 bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
                <Icon icon="lucide:alert-circle" class="size-4 flex-shrink-0 mt-0.5" />
                {{ saveError }}
              </div>

              <div v-if="saved"
                class="flex items-start gap-2 bg-green-50 text-green-700 text-sm rounded-xl px-4 py-3">
                <Icon icon="lucide:check-circle" class="size-4 flex-shrink-0 mt-0.5" />
                Cambios guardados correctamente.
              </div>

              <div class="flex gap-3 pt-1">
                <button type="submit" :disabled="loading"
                  class="flex-1 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                  <Icon v-if="loading" icon="lucide:loader-circle" class="size-4 animate-spin" />
                  Guardar cambios
                </button>
                <button type="button" @click="resetForm"
                  class="flex-1 py-2.5 border border-default-200 rounded-xl text-sm text-default-600 hover:bg-default-50 transition-colors">
                  Restablecer
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  </Vertical>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import Vertical from '@/layouts/vertical.vue'
import { useUsers, type UserItem } from '@/composables/useUsers'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const auth  = useAuthStore()
const API   = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const { loading, fetchUser, updateUser } = useUsers()

interface RolOpt { id: number; nombre: string }

const user             = ref<UserItem | null>(null)
const saveError        = ref<string | null>(null)
const saved            = ref(false)
const rolesDisponibles = ref<RolOpt[]>([])

const form = ref({ name: '', email: '', rol_id: 2 as number, is_active: true, password: '' })

onMounted(async () => {
  const [u] = await Promise.all([
    fetchUser(Number(route.params.id)),
    cargarRoles(),
  ])
  user.value = u
  if (user.value) resetForm()
})

async function cargarRoles() {
  try {
    const res = await auth.authFetch(`${API}/roles`)
    if (res.ok) rolesDisponibles.value = await res.json()
  } catch {}
}

function resetForm() {
  if (!user.value) return
  form.value = {
    name:      user.value.name,
    email:     user.value.email,
    rol_id:    (user.value as any).rol_id ?? 2,
    is_active: user.value.is_active,
    password:  '',
  }
  saveError.value = null
  saved.value = false
}

async function save() {
  saveError.value = null
  saved.value = false
  const payload: Record<string, unknown> = {
    name:      form.value.name,
    email:     form.value.email,
    rol_id:    form.value.rol_id,
    is_active: form.value.is_active,
  }
  if (form.value.password) payload.password = form.value.password
  const updated = await updateUser(Number(route.params.id), payload)
  if (updated) {
    user.value = updated
    form.value.password = ''
    saved.value = true
    setTimeout(() => (saved.value = false), 3000)
  } else {
    saveError.value = 'No se pudieron guardar los cambios. Verifica los datos.'
  }
}

function initials(name: string) {
  return (name ?? '?').split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
}

function roleLabel(role: string) {
  return role === 'admin' ? 'Admin' : 'Usuario'
}

function roleBadgeClass(role: string) {
  return role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-rose-50 text-rose-500'
}

function avatarColor(role: string) {
  return role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-600'
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>
