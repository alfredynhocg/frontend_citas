<template>
  <Vertical>
    <div class="p-4 sm:p-6 space-y-6">

      <div class="flex items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-default-900">Usuarios</h1>
          <p class="text-sm text-default-500 mt-0.5">Gestión de cuentas registradas.</p>
        </div>
        <span class="text-sm text-default-400 pt-1.5">{{ total }} usuario(s)</span>
      </div>

      <div class="card p-4 flex flex-wrap gap-3 items-center">
        <div class="relative flex-1 min-w-44">
          <Icon icon="lucide:search" class="absolute left-3 top-1/2 -translate-y-1/2 text-default-400 size-4" />
          <input v-model="search" type="text" placeholder="Buscar nombre o email…"
            class="w-full border border-default-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
        </div>
        <select v-model="roleFilter"
          class="border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
          <option value="">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="couple">Pareja</option>
          <option value="guest">Invitado</option>
        </select>
      </div>

      <div class="card overflow-hidden">
        <div v-if="loading" class="flex justify-center py-16">
          <Icon icon="lucide:loader-circle" class="size-8 animate-spin text-rose-400" />
        </div>

        <div v-else-if="error" class="p-6 flex items-center gap-2 text-red-500 text-sm">
          <Icon icon="lucide:alert-circle" class="size-5 flex-shrink-0" />
          {{ error }}
        </div>

        <template v-else>
          <div class="sm:hidden divide-y divide-default-100">
            <div v-if="!filtered.length" class="py-12 text-center text-default-400 text-sm">
              No se encontraron usuarios
            </div>
            <div v-for="u in filtered" :key="u.id" class="p-4 flex items-center gap-3">
              <div class="size-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                :class="avatarColor(u.role)">
                {{ initials(u.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-default-900 text-sm truncate">{{ u.name }}</p>
                <p class="text-xs text-default-400 truncate">{{ u.email }}</p>
                <div class="flex gap-1.5 mt-1">
                  <span :class="roleBadgeClass(u.role)"
                    class="text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {{ roleLabel(u.role) }}
                  </span>
                  <span :class="u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
                    class="text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    {{ u.is_active ? 'Activo' : 'Inactivo' }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2 flex-shrink-0">
                <router-link :to="{ name: 'UserDetail', params: { id: u.id } }"
                  class="size-8 rounded-lg border border-default-200 flex items-center justify-center hover:bg-default-50 transition-colors">
                  <Icon icon="lucide:pencil" class="size-3.5 text-default-500" />
                </router-link>
                <button @click="confirmDelete(u)" :disabled="u.id === authStore.user?.id"
                  class="size-8 rounded-lg border border-red-100 flex items-center justify-center hover:bg-red-50 transition-colors disabled:opacity-30">
                  <Icon icon="lucide:trash-2" class="size-3.5 text-red-400" />
                </button>
              </div>
            </div>
          </div>

          <div class="hidden sm:block overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-default-50 border-b border-default-100">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wide w-10">#</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wide">Usuario</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wide">Email</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wide">Rol</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wide">Estado</th>
                  <th class="px-4 py-3 text-left text-xs font-semibold text-default-500 uppercase tracking-wide">Registrado</th>
                  <th class="px-4 py-3 text-right text-xs font-semibold text-default-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default-100">
                <tr v-if="!filtered.length">
                  <td colspan="7" class="text-center py-12 text-default-400">No se encontraron usuarios</td>
                </tr>
                <tr v-for="u in filtered" :key="u.id" class="hover:bg-default-50 transition-colors">
                  <td class="px-4 py-3 text-default-400">{{ u.id }}</td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="size-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        :class="avatarColor(u.role)">
                        {{ initials(u.name) }}
                      </div>
                      <span class="font-medium text-default-900">{{ u.name }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-default-500">{{ u.email }}</td>
                  <td class="px-4 py-3">
                    <span :class="roleBadgeClass(u.role)"
                      class="text-xs font-semibold px-2.5 py-1 rounded-full">
                      {{ roleLabel(u.role) }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <span :class="u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
                      class="text-xs font-semibold px-2.5 py-1 rounded-full">
                      {{ u.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-default-400 text-xs">{{ formatDate(u.created_at) }}</td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2 justify-end">
                      <router-link :to="{ name: 'UserDetail', params: { id: u.id } }"
                        class="inline-flex items-center gap-1.5 text-xs font-medium border border-default-200 px-3 py-1.5 rounded-lg hover:bg-default-50 transition-colors text-default-600">
                        <Icon icon="lucide:pencil" class="size-3.5" />
                        Editar
                      </router-link>
                      <button @click="confirmDelete(u)" :disabled="u.id === authStore.user?.id"
                        class="inline-flex items-center gap-1.5 text-xs font-medium border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-500 disabled:opacity-30">
                        <Icon icon="lucide:trash-2" class="size-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="pages > 1" class="flex items-center justify-between px-4 py-3 border-t border-default-100">
            <span class="text-xs text-default-400">Página {{ page }} de {{ pages }}</span>
            <div class="flex gap-2">
              <button :disabled="page <= 1" @click="page--"
                class="size-8 rounded-lg border border-default-200 flex items-center justify-center hover:bg-default-50 disabled:opacity-30 transition-colors">
                <Icon icon="lucide:chevron-left" class="size-4 text-default-500" />
              </button>
              <button :disabled="page >= pages" @click="page++"
                class="size-8 rounded-lg border border-default-200 flex items-center justify-center hover:bg-default-50 disabled:opacity-30 transition-colors">
                <Icon icon="lucide:chevron-right" class="size-4 text-default-500" />
              </button>
            </div>
          </div>
        </template>
      </div>

    </div>

    <Teleport to="body">
      <div v-if="toDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="toDelete = null">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
          <div class="size-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <Icon icon="lucide:trash-2" class="size-7 text-red-500" />
          </div>
          <div>
            <p class="font-bold text-default-900 text-lg">¿Eliminar usuario?</p>
            <p class="text-sm text-default-500 mt-1">
              Se eliminará a <strong>{{ toDelete.name }}</strong> de forma permanente.
            </p>
          </div>
          <div class="flex gap-3">
            <button @click="toDelete = null"
              class="flex-1 py-2.5 border border-default-200 rounded-xl text-sm text-default-600 hover:bg-default-50 transition-colors">
              Cancelar
            </button>
            <button @click="doDelete" :disabled="loading"
              class="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              <Icon v-if="loading" icon="lucide:loader-circle" class="size-4 animate-spin" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </Vertical>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Vertical from '@/layouts/vertical.vue'
import { useUsers, type UserItem } from '@/composables/useUsers'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { loading, error, fetchUsers, deleteUser } = useUsers()

const search     = ref('')
const roleFilter = ref('')
const page       = ref(1)
const pages      = ref(1)
const total      = ref(0)
const items      = ref<UserItem[]>([])
const toDelete   = ref<UserItem | null>(null)

const filtered = computed(() => {
  const q = search.value.toLowerCase()
  if (!q) return items.value
  return items.value.filter(
    (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
  )
})

async function load() {
  const data = await fetchUsers({ page: page.value, per_page: 20, role: roleFilter.value || undefined })
  items.value  = data.items
  total.value  = data.total
  pages.value  = data.pages
}

watch([page, roleFilter], load)
onMounted(load)

function initials(name: string) {
  return (name ?? '?').split(' ').slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
}

function roleLabel(role: string) {
  return { admin: 'Admin', couple: 'Pareja', guest: 'Invitado' }[role] ?? role
}

function roleBadgeClass(role: string) {
  return ({
    admin:  'bg-purple-100 text-purple-700',
    couple: 'bg-pink-100 text-pink-700',
    guest:  'bg-default-100 text-default-600',
  } as Record<string, string>)[role] ?? 'bg-default-100 text-default-600'
}

function avatarColor(role: string) {
  return ({
    admin:  'bg-purple-100 text-purple-700',
    couple: 'bg-rose-100 text-rose-600',
    guest:  'bg-default-100 text-default-500',
  } as Record<string, string>)[role] ?? 'bg-default-100 text-default-500'
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' })
}

function confirmDelete(u: UserItem) {
  toDelete.value = u
}

async function doDelete() {
  if (!toDelete.value) return
  const ok = await deleteUser(toDelete.value.id)
  if (ok) {
    toDelete.value = null
    await load()
  }
}
</script>
