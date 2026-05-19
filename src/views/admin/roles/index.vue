<template>
  <Vertical>
    <div class="p-4 sm:p-6 space-y-6">

      <div class="flex items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-default-900">Roles</h1>
          <p class="text-sm text-default-500 mt-0.5">Gestión de roles y permisos del sistema.</p>
        </div>
        <button @click="abrirCrear"
          class="inline-flex items-center gap-2 bg-rose-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-rose-600 transition-colors flex-shrink-0">
          <Icon icon="lucide:plus" class="size-4" />
          Nuevo rol
        </button>
      </div>

      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 2" :key="i" class="card p-5 animate-pulse space-y-3">
          <div class="flex items-center gap-3">
            <div class="size-12 rounded-xl bg-default-100" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-default-100 rounded w-1/2" />
              <div class="h-3 bg-default-100 rounded w-1/3" />
            </div>
          </div>
          <div class="h-3 bg-default-100 rounded" />
        </div>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="rol in roles" :key="rol.id"
          class="card p-5 space-y-4 border-l-4"
          :class="rol.id === 1 ? 'border-l-purple-400' : 'border-l-rose-300'">

          <div class="flex items-start gap-3">
            <div class="size-12 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="rol.id === 1 ? 'bg-purple-100' : 'bg-rose-50'">
              <Icon :icon="rol.id === 1 ? 'lucide:shield' : 'lucide:user'"
                class="size-6"
                :class="rol.id === 1 ? 'text-purple-600' : 'text-rose-400'" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold text-default-900 capitalize">{{ rol.nombre }}</p>
              <p class="text-xs text-default-400 mt-0.5">ID #{{ rol.id }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 bg-default-50 rounded-xl px-3 py-2">
            <Icon icon="lucide:users" class="size-4 text-default-400 flex-shrink-0" />
            <span class="text-sm text-default-600">
              <strong class="text-default-900">{{ rol.total_usuarios }}</strong> usuario{{ rol.total_usuarios !== 1 ? 's' : '' }}
            </span>
          </div>

          <div v-if="rol.id <= 2"
            class="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5">
            <Icon icon="lucide:lock" class="size-3.5 flex-shrink-0" />
            Rol del sistema — nombre editable
          </div>

          <div class="flex gap-2 pt-1">
            <button @click="abrirEditar(rol)"
              class="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium border border-default-200 px-3 py-2 rounded-lg hover:bg-default-50 transition-colors text-default-600">
              <Icon icon="lucide:pencil" class="size-3.5" />
              Editar
            </button>
            <button @click="confirmEliminar(rol)"
              :disabled="rol.id <= 2 || rol.total_usuarios > 0"
              :title="rol.id <= 2 ? 'Rol del sistema' : rol.total_usuarios > 0 ? 'Tiene usuarios asignados' : 'Eliminar'"
              class="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium border border-red-100 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors text-red-400 disabled:opacity-30 disabled:cursor-not-allowed">
              <Icon icon="lucide:trash-2" class="size-3.5" />
              Eliminar
            </button>
          </div>
        </div>

        <div v-if="!roles.length && !loading"
          class="sm:col-span-2 lg:col-span-3 card p-12 text-center space-y-3">
          <div class="size-16 rounded-full bg-default-100 flex items-center justify-center mx-auto">
            <Icon icon="lucide:shield-off" class="size-8 text-default-300" />
          </div>
          <p class="font-semibold text-default-700">No hay roles registrados</p>
        </div>
      </div>

      <div v-if="roles.length" class="card p-5 space-y-3">
        <h2 class="font-bold text-default-900 text-sm">Permisos por rol</h2>
        <div class="space-y-2">
          <div v-for="item in permisosInfo" :key="item.rol"
            class="flex items-start gap-3 p-3 rounded-xl"
            :class="item.bg">
            <div class="size-8 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="item.iconBg">
              <Icon :icon="item.icon" class="size-4" :class="item.iconColor" />
            </div>
            <div>
              <p class="font-semibold text-sm" :class="item.titleColor">{{ item.rol }}</p>
              <ul class="mt-1 space-y-0.5">
                <li v-for="p in item.permisos" :key="p"
                  class="text-xs flex items-center gap-1.5" :class="item.textColor">
                  <Icon icon="lucide:check" class="size-3 flex-shrink-0" />
                  {{ p }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>

    <Teleport to="body">
      <div v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showModal = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
          <div class="p-5 border-b border-default-100 flex items-center justify-between">
            <h3 class="font-bold text-default-900">
              {{ editando ? 'Editar rol' : 'Nuevo rol' }}
            </h3>
            <button @click="showModal = false"
              class="size-8 rounded-full hover:bg-default-100 flex items-center justify-center transition-colors">
              <Icon icon="lucide:x" class="size-4 text-default-500" />
            </button>
          </div>
          <div class="p-5 space-y-4">

            <div>
              <label class="text-xs font-medium text-default-600 mb-1 block">Nombre del rol</label>
              <input v-model="formNombre" type="text" placeholder="ej: moderador"
                class="w-full border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                @keyup.enter="guardar" />
            </div>

            <p v-if="errorModal" class="text-sm text-red-500 flex items-center gap-1.5">
              <Icon icon="lucide:alert-circle" class="size-4 flex-shrink-0" />
              {{ errorModal }}
            </p>

            <div class="flex gap-3">
              <button @click="showModal = false"
                class="flex-1 py-2.5 border border-default-200 rounded-xl text-sm text-default-600 hover:bg-default-50 transition-colors">
                Cancelar
              </button>
              <button @click="guardar" :disabled="loadingGuardar || !formNombre.trim()"
                class="flex-1 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                <Icon v-if="loadingGuardar" icon="lucide:loader-circle" class="size-4 animate-spin" />
                {{ editando ? 'Guardar cambios' : 'Crear rol' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="rolAEliminar"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="rolAEliminar = null">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
          <div class="size-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <Icon icon="lucide:trash-2" class="size-7 text-red-500" />
          </div>
          <div>
            <p class="font-bold text-default-900 text-lg">¿Eliminar rol?</p>
            <p class="text-sm text-default-500 mt-1">
              Se eliminará el rol <strong>{{ rolAEliminar.nombre }}</strong> de forma permanente.
            </p>
          </div>
          <p v-if="errorEliminar" class="text-sm text-red-500">{{ errorEliminar }}</p>
          <div class="flex gap-3">
            <button @click="rolAEliminar = null"
              class="flex-1 py-2.5 border border-default-200 rounded-xl text-sm text-default-600 hover:bg-default-50 transition-colors">
              Cancelar
            </button>
            <button @click="doEliminar" :disabled="loadingEliminar"
              class="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              <Icon v-if="loadingEliminar" icon="lucide:loader-circle" class="size-4 animate-spin" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

  </Vertical>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Vertical from '@/layouts/vertical.vue'
import { useAuthStore } from '@/stores/auth'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const auth = useAuthStore()

interface Rol { id: number; nombre: string; total_usuarios: number }

const loading        = ref(true)
const roles          = ref<Rol[]>([])
const showModal      = ref(false)
const editando       = ref<Rol | null>(null)
const formNombre     = ref('')
const errorModal     = ref('')
const loadingGuardar = ref(false)
const rolAEliminar   = ref<Rol | null>(null)
const errorEliminar  = ref('')
const loadingEliminar = ref(false)

const permisosInfo = [
  {
    rol: 'Administrador',
    bg: 'bg-purple-50',
    icon: 'lucide:shield',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
    titleColor: 'text-purple-700',
    textColor: 'text-purple-600',
    permisos: [
      'Gestión completa de usuarios y roles',
      'Aprobar / rechazar pagos y suscripciones',
      'Administrar citas, negocios y categorías',
      'Ver estadísticas y reportes globales',
      'Acceso al panel de administración',
    ],
  },
  {
    rol: 'Usuario normal',
    bg: 'bg-rose-50',
    icon: 'lucide:user',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-500',
    titleColor: 'text-rose-600',
    textColor: 'text-rose-500',
    permisos: [
      'Ver y completar citas disponibles',
      'Gestionar su perfil y contraseña',
      'Crear / unirse a grupos',
      'Enviar mensajes y ver recuerdos',
      'Contratar planes de suscripción',
    ],
  },
]

async function cargar() {
  loading.value = true
  try {
    const res = await auth.authFetch(`${API}/roles`)
    if (res.ok) roles.value = await res.json()
  } catch {}
  loading.value = false
}

function abrirCrear() {
  editando.value = null
  formNombre.value = ''
  errorModal.value = ''
  showModal.value = true
}

function abrirEditar(rol: Rol) {
  editando.value = rol
  formNombre.value = rol.nombre
  errorModal.value = ''
  showModal.value = true
}

async function guardar() {
  errorModal.value = ''
  if (!formNombre.value.trim()) return
  loadingGuardar.value = true
  try {
    const url    = editando.value ? `${API}/roles/${editando.value.id}` : `${API}/roles`
    const method = editando.value ? 'PUT' : 'POST'
    const res    = await auth.authFetch(url, { method, body: JSON.stringify({ nombre: formNombre.value.trim() }) })
    if (!res.ok) {
      const e = await res.json()
      errorModal.value = e.message ?? 'Error al guardar'
      return
    }
    showModal.value = false
    await cargar()
  } catch {
    errorModal.value = 'Error de conexión'
  } finally {
    loadingGuardar.value = false
  }
}

function confirmEliminar(rol: Rol) {
  errorEliminar.value = ''
  rolAEliminar.value = rol
}

async function doEliminar() {
  if (!rolAEliminar.value) return
  errorEliminar.value = ''
  loadingEliminar.value = true
  try {
    const res = await auth.authFetch(`${API}/roles/${rolAEliminar.value.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const e = await res.json()
      errorEliminar.value = e.message ?? 'Error al eliminar'
      return
    }
    rolAEliminar.value = null
    await cargar()
  } catch {
    errorEliminar.value = 'Error de conexión'
  } finally {
    loadingEliminar.value = false
  }
}

onMounted(cargar)
</script>
