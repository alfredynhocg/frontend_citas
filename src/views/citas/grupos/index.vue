<template>
  <Vertical>
    <div class="p-4 sm:p-6 space-y-6">

      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-default-900">Mis Grupos</h1>
          <p class="text-sm text-default-500 mt-0.5">Gestiona tus grupos y únete con código de invitación.</p>
        </div>
        <button @click="mostrarCrear = true" class="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-xl transition-colors">
          <Icon icon="lucide:plus" class="size-4" />
          Nuevo grupo
        </button>
      </div>

      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 3" :key="i" class="card p-5 animate-pulse space-y-3">
          <div class="h-4 bg-default-100 rounded w-2/3" />
          <div class="h-3 bg-default-100 rounded w-1/3" />
          <div class="h-8 bg-default-100 rounded-xl" />
        </div>
      </div>

      <div v-else-if="grupos.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="g in grupos" :key="g.id" class="card p-5 space-y-4">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-semibold text-default-900">{{ g.nombre }}</h3>
              <span class="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mt-1"
                :class="g.tipo === 'pareja' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'">
                <Icon :icon="g.tipo === 'pareja' ? 'lucide:heart' : 'lucide:users'" class="size-3" />
                {{ g.tipo }}
              </span>
            </div>
            <Icon icon="lucide:users-round" class="size-8 text-default-200" />
          </div>
          <div class="bg-default-50 rounded-xl px-3 py-2 flex items-center justify-between">
            <span class="text-xs text-default-500">Código</span>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-default-900 tracking-widest text-sm">{{ g.codigo_invitacion }}</span>
              <button @click="copiarCodigo(g.codigo_invitacion)" class="text-default-400 hover:text-rose-500 transition-colors">
                <Icon icon="lucide:copy" class="size-3.5" />
              </button>
            </div>
          </div>
          <button @click="verMiembros(g)" class="w-full text-xs text-default-500 hover:text-rose-500 transition-colors flex items-center justify-center gap-1">
            <Icon icon="lucide:users" class="size-3.5" />
            Ver miembros
          </button>
        </div>
      </div>

      <div v-else class="card p-12 text-center space-y-4">
        <div class="size-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
          <Icon icon="lucide:users-round" class="size-8 text-rose-400" />
        </div>
        <div>
          <h3 class="font-semibold text-default-900">Sin grupos aún</h3>
          <p class="text-sm text-default-400 mt-1">Crea un grupo o únete con un código de invitación.</p>
        </div>
        <div class="flex justify-center gap-3">
          <button @click="mostrarCrear = true" class="px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-xl hover:bg-rose-600 transition-colors">
            Crear grupo
          </button>
          <button @click="mostrarUnir = true" class="px-4 py-2 border border-default-200 text-default-700 text-sm font-medium rounded-xl hover:bg-default-50 transition-colors">
            Unirme con código
          </button>
        </div>
      </div>

      <div v-if="grupos.length" class="card p-5">
        <h3 class="font-semibold text-default-800 mb-3">Unirse a un grupo</h3>
        <div class="flex gap-3">
          <input v-model="codigoUnirse" type="text" placeholder="Ingresa el código" maxlength="8"
            class="flex-1 border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-mono uppercase tracking-widest" />
          <button @click="unirseGrupo" :disabled="!codigoUnirse || loadingUnir"
            class="px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-xl hover:bg-rose-600 disabled:opacity-50 transition-colors">
            {{ loadingUnir ? 'Uniéndome...' : 'Unirse' }}
          </button>
        </div>
        <p v-if="errorUnir" class="text-xs text-red-500 mt-2">{{ errorUnir }}</p>
      </div>

    </div>

    <div v-if="mostrarCrear" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-default-900">Nuevo grupo</h2>
          <button @click="mostrarCrear = false" class="text-default-400 hover:text-default-600">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-default-600 mb-1 block">Nombre del grupo</label>
            <input v-model="nuevoGrupo.nombre" type="text" placeholder="Ej: Aventureros 2025"
              class="w-full border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          </div>
          <div>
            <label class="text-xs font-medium text-default-600 mb-1 block">Tipo</label>
            <select v-model="nuevoGrupo.tipo" class="w-full border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
              <option value="pareja">Pareja</option>
              <option value="amigos">Amigos</option>
              <option value="familia">Familia</option>
            </select>
          </div>
          <p v-if="errorCrear" class="text-xs text-red-500">{{ errorCrear }}</p>
        </div>
        <div class="flex gap-3 pt-2">
          <button @click="mostrarCrear = false" class="flex-1 py-2 border border-default-200 rounded-xl text-sm text-default-600 hover:bg-default-50 transition-colors">Cancelar</button>
          <button @click="crearGrupo" :disabled="!nuevoGrupo.nombre || loadingCrear"
            class="flex-1 py-2 bg-rose-500 text-white text-sm font-medium rounded-xl hover:bg-rose-600 disabled:opacity-50 transition-colors">
            {{ loadingCrear ? 'Creando...' : 'Crear grupo' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="grupoActivo" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-bold text-default-900">{{ grupoActivo.nombre }}</h2>
          <button @click="grupoActivo = null" class="text-default-400 hover:text-default-600">
            <Icon icon="lucide:x" class="size-5" />
          </button>
        </div>
        <p class="text-xs text-default-500">Código: <span class="font-mono font-bold tracking-widest">{{ grupoActivo.codigo_invitacion }}</span></p>
        <div v-if="loadingMiembros" class="py-6 flex justify-center">
          <Icon icon="lucide:loader-circle" class="size-6 animate-spin text-rose-400" />
        </div>
        <ul v-else class="divide-y divide-default-100">
          <li v-for="m in miembros" :key="m.id" class="py-3 flex items-center gap-3">
            <div class="size-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-sm flex-shrink-0">
              {{ initials(m.nombre) }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-default-900 truncate">{{ m.nombre }}</p>
              <p class="text-xs text-default-400 truncate">{{ m.email }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>

  </Vertical>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Vertical from '@/layouts/vertical.vue'
import { useAuthStore } from '@/stores/auth'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const auth = useAuthStore()

const grupos = ref<any[]>([])
const loading = ref(true)
const mostrarCrear = ref(false)
const mostrarUnir = ref(false)
const loadingCrear = ref(false)
const errorCrear = ref('')
const codigoUnirse = ref('')
const loadingUnir = ref(false)
const errorUnir = ref('')
const grupoActivo = ref<any>(null)
const miembros = ref<any[]>([])
const loadingMiembros = ref(false)

const nuevoGrupo = ref({ nombre: '', tipo: 'pareja' })

function initials(name: string) {
  return name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() ?? '?'
}

async function cargarGrupos() {
  loading.value = true
  try {
    const res = await auth.authFetch(`${API}/grupos`)
    if (res.ok) grupos.value = await res.json()
  } finally {
    loading.value = false
  }
}

async function crearGrupo() {
  errorCrear.value = ''
  loadingCrear.value = true
  try {
    const res = await auth.authFetch(`${API}/grupos`, {
      method: 'POST',
      body: JSON.stringify(nuevoGrupo.value),
    })
    if (!res.ok) {
      const e = await res.json()
      errorCrear.value = e.message ?? 'Error al crear grupo'
      return
    }
    const nuevo = await res.json()
    grupos.value.unshift(nuevo)
    mostrarCrear.value = false
    nuevoGrupo.value = { nombre: '', tipo: 'pareja' }
  } finally {
    loadingCrear.value = false
  }
}

async function unirseGrupo() {
  errorUnir.value = ''
  loadingUnir.value = true
  try {
    const res = await auth.authFetch(`${API}/grupos/unir/${codigoUnirse.value.toUpperCase()}`, {
      method: 'POST',
    })
    if (!res.ok) {
      errorUnir.value = 'Código inválido o ya eres miembro.'
      return
    }
    codigoUnirse.value = ''
    cargarGrupos()
  } finally {
    loadingUnir.value = false
  }
}

async function verMiembros(grupo: any) {
  grupoActivo.value = grupo
  miembros.value = []
  loadingMiembros.value = true
  try {
    const res = await auth.authFetch(`${API}/grupos/${grupo.id}`)
    if (res.ok) {
      const data = await res.json()
      miembros.value = data.miembros ?? []
    }
  } finally {
    loadingMiembros.value = false
  }
}

function copiarCodigo(codigo: string) {
  navigator.clipboard.writeText(codigo)
}

onMounted(cargarGrupos)
</script>
