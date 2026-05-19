<template>
  <Vertical>
    <div class="p-4 sm:p-6 space-y-6">

      <div>
        <h1 class="text-2xl font-bold text-default-900">Gestión de Pagos</h1>
        <p class="text-sm text-default-500 mt-0.5">Aprueba o rechaza los pagos de suscripción pendientes.</p>
      </div>

      <div v-if="reportes" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card p-4 flex items-center gap-3">
          <div class="size-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Icon icon="lucide:clock" class="size-5 text-amber-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-default-900">{{ reportes.pagos_pendientes }}</p>
            <p class="text-xs text-default-400">Pendientes</p>
          </div>
        </div>
        <div class="card p-4 flex items-center gap-3">
          <div class="size-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <Icon icon="lucide:check-circle" class="size-5 text-green-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-default-900">{{ reportes.pagos_aprobados }}</p>
            <p class="text-xs text-default-400">Aprobados</p>
          </div>
        </div>
        <div class="card p-4 flex items-center gap-3">
          <div class="size-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Icon icon="lucide:dollar-sign" class="size-5 text-rose-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-default-900">Bs {{ reportes.ingresos_totales?.toFixed(0) }}</p>
            <p class="text-xs text-default-400">Ingresos</p>
          </div>
        </div>
        <div class="card p-4 flex items-center gap-3">
          <div class="size-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Icon icon="lucide:store" class="size-5 text-blue-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-default-900">{{ reportes.negocios_pendientes }}</p>
            <p class="text-xs text-default-400">Negocios pend.</p>
          </div>
        </div>
      </div>

      <div class="flex gap-2 border-b border-default-100">
        <button v-for="tab in tabs" :key="tab.key" @click="tabActiva = tab.key"
          class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px"
          :class="tabActiva === tab.key
            ? 'border-rose-500 text-rose-600'
            : 'border-transparent text-default-500 hover:text-default-700'">
          {{ tab.label }}
          <span v-if="tab.count" class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
            :class="tabActiva === tab.key ? 'bg-rose-100 text-rose-600' : 'bg-default-100 text-default-500'">
            {{ tab.count }}
          </span>
        </button>
      </div>

      <div v-if="tabActiva === 'pagos'">
        <div v-if="loadingPagos" class="space-y-3">
          <div v-for="i in 3" :key="i" class="card p-4 animate-pulse flex gap-4">
            <div class="size-10 bg-default-100 rounded-xl flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-default-100 rounded w-1/3" />
              <div class="h-3 bg-default-100 rounded w-1/2" />
            </div>
            <div class="h-8 bg-default-100 rounded-xl w-24" />
          </div>
        </div>
        <div v-else-if="!pagos.length" class="card p-12 text-center">
          <Icon icon="lucide:check-circle" class="size-12 text-green-300 mx-auto" />
          <p class="mt-3 text-sm text-default-400">Sin pagos pendientes</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="p in pagos" :key="p.id" class="card p-4 flex flex-wrap items-center gap-4">
            <div class="size-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Icon icon="lucide:receipt" class="size-5 text-amber-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm text-default-900">{{ p.usuario }}</p>
              <p class="text-xs text-default-400">Bs {{ p.monto }} · {{ p.fecha_pago?.slice(0, 10) }}</p>
            </div>
            <a v-if="p.comprobante_url" :href="p.comprobante_url" target="_blank"
              class="text-xs text-blue-500 hover:underline flex items-center gap-1">
              <Icon icon="lucide:external-link" class="size-3.5" />
              Comprobante
            </a>
            <div class="flex gap-2">
              <button @click="aprobarPago(p.id)" :disabled="procesando === p.id"
                class="px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1">
                <Icon icon="lucide:check" class="size-3.5" />
                Aprobar
              </button>
              <button @click="rechazarPago(p.id)" :disabled="procesando === p.id"
                class="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1">
                <Icon icon="lucide:x" class="size-3.5" />
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="tabActiva === 'negocios'">
        <div v-if="loadingNegocios" class="space-y-3">
          <div v-for="i in 3" :key="i" class="card p-4 animate-pulse flex gap-4">
            <div class="size-10 bg-default-100 rounded-xl flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-default-100 rounded w-1/3" />
              <div class="h-3 bg-default-100 rounded w-1/4" />
            </div>
          </div>
        </div>
        <div v-else-if="!negocios.length" class="card p-12 text-center">
          <Icon icon="lucide:store" class="size-12 text-default-200 mx-auto" />
          <p class="mt-3 text-sm text-default-400">Sin negocios pendientes</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="n in negocios" :key="n.id" class="card p-4 flex flex-wrap items-center gap-4">
            <div class="size-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Icon icon="lucide:store" class="size-5 text-blue-600" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm text-default-900">{{ n.nombre }}</p>
              <p class="text-xs text-default-400">{{ n.categoria_negocio }} · {{ n.departamento }}</p>
            </div>
            <div class="flex gap-2">
              <button @click="aprobarNegocio(n.id)" :disabled="procesandoNegocio === n.id"
                class="px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1">
                <Icon icon="lucide:check" class="size-3.5" />
                Aprobar
              </button>
              <button @click="rechazarNegocio(n.id)" :disabled="procesandoNegocio === n.id"
                class="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1">
                <Icon icon="lucide:x" class="size-3.5" />
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </Vertical>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Vertical from '@/layouts/vertical.vue'
import { useAuthStore } from '@/stores/auth'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const auth = useAuthStore()

const pagos = ref<any[]>([])
const negocios = ref<any[]>([])
const reportes = ref<any>(null)
const loadingPagos = ref(true)
const loadingNegocios = ref(true)
const procesando = ref<number | null>(null)
const procesandoNegocio = ref<number | null>(null)
const tabActiva = ref<'pagos' | 'negocios'>('pagos')

const tabs = computed(() => [
  { key: 'pagos', label: 'Pagos pendientes', count: pagos.value.length },
  { key: 'negocios', label: 'Negocios pendientes', count: negocios.value.length },
])

async function cargarPagos() {
  loadingPagos.value = true
  try {
    const res = await auth.authFetch(`${API}/admin/pagos/pendientes`)
    if (res.ok) pagos.value = await res.json()
  } finally {
    loadingPagos.value = false
  }
}

async function cargarNegocios() {
  loadingNegocios.value = true
  try {
    const res = await auth.authFetch(`${API}/admin/negocios/pendientes`)
    if (res.ok) negocios.value = await res.json()
  } finally {
    loadingNegocios.value = false
  }
}

async function cargarReportes() {
  try {
    const res = await auth.authFetch(`${API}/admin/reportes`)
    if (res.ok) reportes.value = await res.json()
  } catch {}
}

async function aprobarPago(id: number) {
  procesando.value = id
  try {
    const res = await auth.authFetch(`${API}/admin/pagos/${id}/aprobar`, { method: 'POST' })
    if (res.ok) {
      pagos.value = pagos.value.filter(p => p.id !== id)
      cargarReportes()
    }
  } finally {
    procesando.value = null
  }
}

async function rechazarPago(id: number) {
  if (!confirm('¿Rechazar este pago?')) return
  procesando.value = id
  try {
    const res = await auth.authFetch(`${API}/admin/pagos/${id}/rechazar`, { method: 'POST' })
    if (res.ok) pagos.value = pagos.value.filter(p => p.id !== id)
  } finally {
    procesando.value = null
  }
}

async function aprobarNegocio(id: number) {
  procesandoNegocio.value = id
  try {
    const res = await auth.authFetch(`${API}/admin/negocios/${id}/aprobar`, { method: 'POST' })
    if (res.ok) negocios.value = negocios.value.filter(n => n.id !== id)
  } finally {
    procesandoNegocio.value = null
  }
}

async function rechazarNegocio(id: number) {
  if (!confirm('¿Rechazar y eliminar este negocio?')) return
  procesandoNegocio.value = id
  try {
    const res = await auth.authFetch(`${API}/admin/negocios/${id}/rechazar`, { method: 'POST' })
    if (res.ok) negocios.value = negocios.value.filter(n => n.id !== id)
  } finally {
    procesandoNegocio.value = null
  }
}

onMounted(() => {
  cargarPagos()
  cargarNegocios()
  cargarReportes()
})
</script>
