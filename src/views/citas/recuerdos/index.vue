<template>
  <Vertical>
    <div class="p-4 sm:p-6 space-y-6">

      <div class="flex items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-default-900">Recuerdos</h1>
          <p class="text-sm text-default-500 mt-0.5">Los momentos que han vivido juntos.</p>
        </div>
        <button @click="abrirModalRegistrar"
          class="inline-flex items-center gap-2 bg-rose-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-rose-600 transition-colors flex-shrink-0">
          <Icon icon="lucide:plus" class="size-4" />
          Registrar cita
        </button>
      </div>

      <div v-if="stats" class="grid grid-cols-3 gap-3">
        <div class="card p-4 text-center">
          <p class="text-2xl font-extrabold text-rose-500">{{ stats.completadas }}</p>
          <p class="text-xs text-default-500 mt-0.5">Completadas</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-extrabold text-default-700">{{ stats.total }}</p>
          <p class="text-xs text-default-500 mt-0.5">Total citas</p>
        </div>
        <div class="card p-4 text-center">
          <p class="text-2xl font-extrabold text-amber-500">{{ stats.porcentaje }}%</p>
          <p class="text-xs text-default-500 mt-0.5">Progreso</p>
        </div>
      </div>

      <div v-if="stats" class="card p-4 space-y-2">
        <div class="flex items-center justify-between text-xs text-default-500">
          <span class="font-medium text-default-700">Progreso del aventurero</span>
          <span>{{ stats.completadas }}/{{ stats.total }}</span>
        </div>
        <div class="h-2.5 bg-default-100 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-full transition-all duration-700"
            :style="{ width: stats.porcentaje + '%' }" />
        </div>
      </div>

      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="card animate-pulse space-y-3 p-4">
          <div class="h-36 bg-default-100 rounded-xl" />
          <div class="h-4 bg-default-100 rounded w-3/4" />
          <div class="h-3 bg-default-100 rounded" />
          <div class="h-3 bg-default-100 rounded w-1/2" />
        </div>
      </div>

      <div v-else-if="recuerdos.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="r in recuerdos" :key="r.id"
          @click="verDetalle(r)"
          class="card overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group">

          <div class="relative h-40 overflow-hidden flex-shrink-0">
            <img v-if="r.cita_imagen"
              :src="`http://localhost:5000${r.cita_imagen}`"
              :alt="r.cita"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div v-else
              class="w-full h-full flex items-center justify-center text-5xl"
              :class="categoryColor(r.cita_categoria)">
              {{ categoryEmoji(r.cita_categoria) }}
            </div>
            <span v-if="r.cita_categoria"
              class="absolute top-2 left-2 text-[10px] font-semibold bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-default-700">
              {{ r.cita_categoria }}
            </span>
          </div>

          <div class="p-4 space-y-2">
            <h3 class="font-bold text-default-900 leading-tight">{{ r.cita }}</h3>

            <p v-if="r.anecdota" class="text-xs text-default-500 line-clamp-2">{{ r.anecdota }}</p>
            <p v-else class="text-xs text-default-300 italic">Sin anécdota guardada</p>

            <div class="flex items-center justify-between pt-1">
              <span class="text-[10px] text-default-400">
                {{ r.fecha_completado?.slice(0, 10) ?? '—' }}
              </span>
              <div class="flex gap-0.5">
                <Icon v-for="s in 5" :key="s" icon="lucide:star" class="size-3.5"
                  :class="r.calificacion && s <= r.calificacion ? 'text-amber-400' : 'text-default-200'" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="card p-16 text-center space-y-3">
        <div class="size-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
          <Icon icon="lucide:camera" class="size-10 text-rose-300" />
        </div>
        <p class="font-semibold text-default-700">Aún no hay recuerdos</p>
        <p class="text-sm text-default-400">Completa una cita y guarda tu primer recuerdo juntos.</p>
        <button @click="abrirModalRegistrar"
          class="mt-2 inline-flex items-center gap-2 bg-rose-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-rose-600 transition-colors">
          <Icon icon="lucide:plus" class="size-4" />
          Registrar primera cita
        </button>
      </div>

    </div>

    <Teleport to="body">
      <div v-if="recuerdoDetalle"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="recuerdoDetalle = null">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="relative h-48">
            <img v-if="recuerdoDetalle.cita_imagen"
              :src="`http://localhost:5000${recuerdoDetalle.cita_imagen}`"
              class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-7xl"
              :class="categoryColor(recuerdoDetalle.cita_categoria)">
              {{ categoryEmoji(recuerdoDetalle.cita_categoria) }}
            </div>
            <button @click="recuerdoDetalle = null"
              class="absolute top-3 right-3 size-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white transition-colors">
              <Icon icon="lucide:x" class="size-4" />
            </button>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <p v-if="recuerdoDetalle.cita_categoria"
                class="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-1">
                {{ recuerdoDetalle.cita_categoria }}
              </p>
              <h2 class="text-xl font-bold text-default-900">{{ recuerdoDetalle.cita }}</h2>
              <p v-if="recuerdoDetalle.cita_descripcion"
                class="text-sm text-default-500 mt-1">{{ recuerdoDetalle.cita_descripcion }}</p>
            </div>
            <div class="flex gap-0.5">
              <Icon v-for="s in 5" :key="s" icon="lucide:star" class="size-5"
                :class="recuerdoDetalle.calificacion && s <= recuerdoDetalle.calificacion ? 'text-amber-400' : 'text-default-200'" />
            </div>
            <div v-if="recuerdoDetalle.anecdota"
              class="bg-rose-50 rounded-xl p-4">
              <p class="text-xs font-semibold text-rose-400 mb-1">Nuestra anécdota</p>
              <p class="text-sm text-default-700 leading-relaxed">{{ recuerdoDetalle.anecdota }}</p>
            </div>
            <p class="text-xs text-default-400 flex items-center gap-1.5">
              <Icon icon="lucide:calendar" class="size-3.5" />
              Completada el {{ recuerdoDetalle.fecha_completado?.slice(0, 10) ?? '—' }}
            </p>
          </div>
        </div>
      </div>
    </Teleport>

    <Teleport to="body">
      <div v-if="showModalRegistrar"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="showModalRegistrar = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div class="p-5 border-b border-default-100 flex items-center justify-between">
            <h3 class="font-bold text-default-900">Registrar cita completada</h3>
            <button @click="showModalRegistrar = false"
              class="size-8 rounded-full hover:bg-default-100 flex items-center justify-center transition-colors">
              <Icon icon="lucide:x" class="size-4 text-default-500" />
            </button>
          </div>
          <div class="p-5 space-y-4">

            <div>
              <label class="text-xs font-medium text-default-600 mb-1 block">Cita realizada</label>
              <select v-model="formRegistrar.cita_id"
                class="w-full border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
                <option value="" disabled>Selecciona una cita...</option>
                <option v-for="c in citasDisponibles" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
              <p v-if="loadingCitas" class="text-xs text-default-400 mt-1">Cargando citas...</p>
            </div>

            <div>
              <label class="text-xs font-medium text-default-600 mb-1 block">Calificación</label>
              <div class="flex gap-1.5">
                <button v-for="s in 5" :key="s"
                  type="button"
                  @click="formRegistrar.calificacion = s"
                  class="transition-transform hover:scale-110">
                  <Icon icon="lucide:star" class="size-7"
                    :class="formRegistrar.calificacion && s <= formRegistrar.calificacion ? 'text-amber-400' : 'text-default-200'" />
                </button>
              </div>
            </div>

            <div>
              <label class="text-xs font-medium text-default-600 mb-1 block">Anécdota (opcional)</label>
              <textarea v-model="formRegistrar.anecdota" rows="3"
                placeholder="¿Qué fue lo más especial de esta cita?"
                class="w-full border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
            </div>

            <p v-if="errorRegistrar" class="text-sm text-red-500">{{ errorRegistrar }}</p>

            <div class="flex gap-3 pt-1">
              <button @click="showModalRegistrar = false"
                class="flex-1 py-2.5 border border-default-200 rounded-xl text-sm text-default-600 hover:bg-default-50 transition-colors">
                Cancelar
              </button>
              <button @click="guardarRecuerdo" :disabled="loadingGuardar || !formRegistrar.cita_id"
                class="flex-1 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                <Icon v-if="loadingGuardar" icon="lucide:loader-circle" class="size-4 animate-spin" />
                {{ loadingGuardar ? 'Guardando...' : 'Guardar recuerdo' }}
              </button>
            </div>
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

const loading = ref(true)
const recuerdos = ref<any[]>([])
const stats = ref<any>(null)
const recuerdoDetalle = ref<any>(null)

const showModalRegistrar = ref(false)
const loadingCitas = ref(false)
const loadingGuardar = ref(false)
const citasDisponibles = ref<any[]>([])
const errorRegistrar = ref('')
const formRegistrar = ref({ cita_id: '', calificacion: 0, anecdota: '' })

const CATEGORY_MAP: Record<string, { bg: string; emoji: string }> = {
  'Gastronomía': { bg: 'bg-orange-50', emoji: '🍽️' },
  'Naturaleza': { bg: 'bg-green-50', emoji: '🌿' },
  'Cultura': { bg: 'bg-purple-50', emoji: '🎭' },
  'Aventura': { bg: 'bg-sky-50', emoji: '🏔️' },
  'Romántico': { bg: 'bg-rose-50', emoji: '💕' },
  'Arte': { bg: 'bg-yellow-50', emoji: '🎨' },
  'Noche': { bg: 'bg-indigo-50', emoji: '🌙' },
}

function categoryColor(cat: string | null) {
  return CATEGORY_MAP[cat ?? '']?.bg ?? 'bg-amber-50'
}

function categoryEmoji(cat: string | null) {
  return CATEGORY_MAP[cat ?? '']?.emoji ?? '📍'
}

async function cargarRecuerdos() {
  loading.value = true
  try {
    const res = await auth.authFetch(`${API}/progreso/mis-recuerdos`)
    if (res.ok) recuerdos.value = await res.json()
  } catch {}
  loading.value = false
}

async function cargarEstadisticas() {
  try {
    const res = await auth.authFetch(`${API}/progreso/estadisticas`)
    if (res.ok) stats.value = await res.json()
  } catch {}
}

async function cargarCitas() {
  loadingCitas.value = true
  try {
    const res = await auth.authFetch(`${API}/citas`)
    if (res.ok) {
      const data = await res.json()
      citasDisponibles.value = Array.isArray(data) ? data : (data.citas ?? [])
    }
  } catch {}
  loadingCitas.value = false
}

function verDetalle(r: any) {
  recuerdoDetalle.value = r
}

function abrirModalRegistrar() {
  formRegistrar.value = { cita_id: '', calificacion: 0, anecdota: '' }
  errorRegistrar.value = ''
  showModalRegistrar.value = true
  if (!citasDisponibles.value.length) cargarCitas()
}

async function guardarRecuerdo() {
  errorRegistrar.value = ''
  loadingGuardar.value = true
  try {
    const res = await auth.authFetch(`${API}/progreso/completar`, {
      method: 'POST',
      body: JSON.stringify({
        cita_id: Number(formRegistrar.value.cita_id),
        tipo: 'individual',
        calificacion: formRegistrar.value.calificacion || null,
        anecdota: formRegistrar.value.anecdota || null,
      }),
    })
    if (!res.ok) {
      const e = await res.json()
      errorRegistrar.value = e.message ?? 'Error al guardar'
      return
    }
    showModalRegistrar.value = false
    await cargarRecuerdos()
    await cargarEstadisticas()
  } catch {
    errorRegistrar.value = 'Error de conexión'
  } finally {
    loadingGuardar.value = false
  }
}

onMounted(() => {
  cargarRecuerdos()
  cargarEstadisticas()
})
</script>
