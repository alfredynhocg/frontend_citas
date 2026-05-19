<template>
  <Vertical>
    <div class="p-4 sm:p-6 space-y-6">

      <div>
        <h1 class="text-2xl font-bold text-default-900">Suscripciones</h1>
        <p class="text-sm text-default-500 mt-0.5">Elige un plan y desbloquea más departamentos.</p>
      </div>

      <div v-if="pagos.length" class="space-y-4">
        <h2 class="text-sm font-semibold text-default-700 uppercase tracking-wide">Mis pagos</h2>

        <div v-for="p in pagos" :key="p.id" class="card p-5 space-y-5">

          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-bold text-default-900 text-base">{{ p.plan }}</p>
              <p class="text-xs text-default-400 mt-0.5">
                Bs {{ p.monto }} &middot; {{ p.tipo_periodo }} &middot; {{ p.metodo_pago }}
              </p>
            </div>
            <a v-if="p.comprobante_url"
              :href="`http://localhost:5000${p.comprobante_url}`"
              target="_blank"
              class="flex-shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-blue-500 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-2.5 py-1.5 rounded-lg transition-colors">
              <Icon icon="lucide:file-text" class="size-3.5" />
              Comprobante
            </a>
          </div>

          <div class="flex items-start">

            <div class="flex flex-col items-center w-20 flex-shrink-0">
              <div class="size-9 rounded-full flex items-center justify-center bg-rose-500 text-white border-2 border-rose-500">
                <Icon icon="lucide:send" class="size-4" />
              </div>
              <p class="text-[10px] font-semibold text-rose-500 mt-1.5 text-center leading-tight">Pago<br>enviado</p>
            </div>

            <div class="flex-1 h-0.5 mt-4 rounded-full"
              :class="p.estado !== 'pendiente' ? 'bg-rose-400' : 'bg-default-200'" />

            <div class="flex flex-col items-center w-20 flex-shrink-0">
              <div class="size-9 rounded-full flex items-center justify-center border-2 transition-all"
                :class="p.estado === 'pendiente'
                  ? 'border-amber-400 bg-amber-50 text-amber-500 ring-4 ring-amber-100'
                  : 'border-rose-500 bg-rose-500 text-white'">
                <Icon :icon="p.estado === 'pendiente' ? 'lucide:loader-circle' : 'lucide:search'"
                  class="size-4" :class="p.estado === 'pendiente' ? 'animate-spin' : ''" />
              </div>
              <p class="text-[10px] font-semibold mt-1.5 text-center leading-tight"
                :class="p.estado === 'pendiente' ? 'text-amber-500' : 'text-rose-500'">
                En<br>revisión
              </p>
            </div>

            <div class="flex-1 h-0.5 mt-4 rounded-full"
              :class="{
                'bg-green-400': p.estado === 'aprobado',
                'bg-red-300':   p.estado === 'rechazado',
                'bg-default-200': p.estado === 'pendiente',
              }" />

            <div class="flex flex-col items-center w-20 flex-shrink-0">
              <div class="size-9 rounded-full flex items-center justify-center border-2 transition-all"
                :class="{
                  'border-default-200 bg-default-50 text-default-300': p.estado === 'pendiente',
                  'border-green-500  bg-green-500  text-white':        p.estado === 'aprobado',
                  'border-red-400    bg-red-400    text-white':        p.estado === 'rechazado',
                }">
                <Icon
                  :icon="p.estado === 'aprobado' ? 'lucide:shield-check' : p.estado === 'rechazado' ? 'lucide:x' : 'lucide:lock'"
                  class="size-4" />
              </div>
              <p class="text-[10px] font-semibold mt-1.5 text-center leading-tight"
                :class="{
                  'text-default-300': p.estado === 'pendiente',
                  'text-green-600':   p.estado === 'aprobado',
                  'text-red-500':     p.estado === 'rechazado',
                }">
                {{ p.estado === 'rechazado' ? 'Rechazado' : 'Activo' }}
              </p>
            </div>

          </div>

          <div class="rounded-xl px-4 py-3 text-xs flex items-start gap-2"
            :class="{
              'bg-amber-50 text-amber-700': p.estado === 'pendiente',
              'bg-green-50 text-green-700': p.estado === 'aprobado',
              'bg-red-50   text-red-600':   p.estado === 'rechazado',
            }">
            <Icon
              :icon="p.estado === 'pendiente' ? 'lucide:clock' : p.estado === 'aprobado' ? 'lucide:check-circle' : 'lucide:alert-circle'"
              class="size-4 flex-shrink-0 mt-0.5" />
            <span>
              <template v-if="p.estado === 'pendiente'">
                Tu pago está siendo revisado. Te notificaremos cuando sea aprobado.
              </template>
              <template v-else-if="p.estado === 'aprobado'">
                ¡Pago aprobado! Tu plan <strong>{{ p.plan }}</strong> ya está activo.
              </template>
              <template v-else>
                El pago fue rechazado. Verifica el comprobante y vuelve a intentarlo.
              </template>
            </span>
          </div>

          <p class="text-[10px] text-default-300">Enviado el {{ p.fecha_pago?.slice(0, 10) }}</p>
        </div>
      </div>

      <div v-if="suscripciones.length" class="space-y-3">
        <h2 class="text-sm font-semibold text-default-700 uppercase tracking-wide">Suscripciones activas</h2>
        <div v-for="s in suscripciones" :key="s.id"
          class="card p-5 flex items-center gap-4 border-l-4"
          :class="s.activo ? 'border-l-green-400' : 'border-l-default-200'">
          <div class="size-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            :class="s.activo ? 'bg-green-100' : 'bg-default-100'">
            <Icon :icon="s.activo ? 'lucide:crown' : 'lucide:shield-off'" class="size-6"
              :class="s.activo ? 'text-green-600' : 'text-default-400'" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-bold text-default-900">{{ s.plan }}</p>
            <p class="text-xs text-default-400 mt-0.5">Vence: {{ s.fecha_expiracion }}</p>
          </div>
          <span class="text-xs font-bold px-3 py-1.5 rounded-full flex-shrink-0"
            :class="s.activo ? 'bg-green-100 text-green-700' : 'bg-default-100 text-default-500'">
            {{ s.activo ? 'Activa' : 'Expirada' }}
          </span>
        </div>
      </div>

      <div class="space-y-3">
        <h2 class="text-sm font-semibold text-default-700 uppercase tracking-wide">Planes disponibles</h2>

        <div v-if="loadingPlanes" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="i in 3" :key="i" class="card p-6 animate-pulse space-y-3">
            <div class="h-5 bg-default-100 rounded w-1/2" />
            <div class="h-8 bg-default-100 rounded w-2/3" />
            <div class="h-3 bg-default-100 rounded" />
            <div class="h-10 bg-default-100 rounded-xl" />
          </div>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="plan in planes" :key="plan.id"
            class="card p-6 space-y-4 border-2 transition-colors"
            :class="planSeleccionado?.id === plan.id ? 'border-rose-400' : 'border-transparent hover:border-rose-200'">
            <div>
              <h3 class="font-bold text-default-900">{{ plan.nombre }}</h3>
              <div class="mt-2 flex items-baseline gap-1">
                <span class="text-3xl font-extrabold text-rose-500">Bs {{ plan.precio_mensual }}</span>
                <span class="text-xs text-default-400">/mes</span>
              </div>
              <p class="text-xs text-default-400 mt-0.5">o Bs {{ plan.precio_anual }}/año</p>
            </div>
            <ul class="space-y-1.5 text-sm text-default-600">
              <li class="flex items-center gap-2">
                <Icon icon="lucide:check" class="size-4 text-green-500 flex-shrink-0" />
                {{ plan.max_integrantes }} integrante{{ plan.max_integrantes > 1 ? 's' : '' }}
              </li>
              <li class="flex items-center gap-2">
                <Icon :icon="plan.permite_grupo ? 'lucide:check' : 'lucide:x'" class="size-4 flex-shrink-0"
                  :class="plan.permite_grupo ? 'text-green-500' : 'text-default-300'" />
                Grupos
              </li>
              <li class="flex items-center gap-2">
                <Icon icon="lucide:check" class="size-4 text-green-500 flex-shrink-0" />
                {{ plan.departamentos_desbloquea }} departamento{{ plan.departamentos_desbloquea > 1 ? 's' : '' }}
              </li>
            </ul>
            <button @click="seleccionarPlan(plan)"
              class="w-full py-2 rounded-xl text-sm font-semibold transition-colors"
              :class="planSeleccionado?.id === plan.id
                ? 'bg-rose-500 text-white'
                : 'border border-rose-300 text-rose-500 hover:bg-rose-50'">
              {{ planSeleccionado?.id === plan.id ? 'Seleccionado' : 'Elegir plan' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="planSeleccionado" class="card p-6 space-y-4">
        <h2 class="font-bold text-default-900">Registrar pago — {{ planSeleccionado.nombre }}</h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="text-xs font-medium text-default-600 mb-1 block">Periodo</label>
            <select v-model="formPago.tipo_periodo" class="w-full border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
              <option value="mensual">Mensual — Bs {{ planSeleccionado.precio_mensual }}</option>
              <option value="anual">Anual — Bs {{ planSeleccionado.precio_anual }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-medium text-default-600 mb-1 block">Método de pago</label>
            <select v-model="formPago.metodo_pago" class="w-full border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
              <option value="transferencia">Transferencia bancaria</option>
              <option value="qr">QR / Billetera digital</option>
              <option value="efectivo">Efectivo</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="text-xs font-medium text-default-600 mb-1 block">Comprobante de pago (imagen o PDF)</label>
            <div
              class="relative border-2 border-dashed rounded-xl p-4 transition-colors cursor-pointer"
              :class="archivoComprobante ? 'border-green-400 bg-green-50' : 'border-default-200 hover:border-rose-300'"
              @click="inputComprobante?.click()"
              @dragover.prevent
              @drop.prevent="onDrop">
              <input
                ref="inputComprobante"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,application/pdf"
                class="hidden"
                @change="onFileChange" />
              <div v-if="!archivoComprobante" class="flex flex-col items-center gap-2 py-2 text-default-400">
                <Icon icon="lucide:upload-cloud" class="size-8" />
                <p class="text-sm">Arrastra o haz clic para subir</p>
                <p class="text-xs">PNG, JPG, GIF, WEBP o PDF · máx 5 MB</p>
              </div>
              <div v-else class="flex items-center gap-3">
                <div class="size-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  :class="archivoComprobante.type === 'application/pdf' ? 'bg-red-100' : 'bg-green-100'">
                  <Icon
                    :icon="archivoComprobante.type === 'application/pdf' ? 'lucide:file-text' : 'lucide:image'"
                    class="size-5"
                    :class="archivoComprobante.type === 'application/pdf' ? 'text-red-500' : 'text-green-600'" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-default-900 truncate">{{ archivoComprobante.name }}</p>
                  <p class="text-xs text-default-400">{{ (archivoComprobante.size / 1024).toFixed(0) }} KB</p>
                </div>
                <button type="button" @click.stop="limpiarArchivo" class="text-default-400 hover:text-red-500 transition-colors">
                  <Icon icon="lucide:x" class="size-4" />
                </button>
              </div>
            </div>
            <div v-if="previewUrl" class="mt-2 rounded-xl overflow-hidden border border-default-100 max-h-40">
              <img :src="previewUrl" class="w-full object-contain max-h-40" alt="Preview comprobante" />
            </div>
            <p v-if="uploadError" class="text-xs text-red-500 mt-1">{{ uploadError }}</p>
            <p v-if="formPago.comprobante_url && !archivoComprobante" class="text-xs text-green-600 mt-1 flex items-center gap-1">
              <Icon icon="lucide:check-circle" class="size-3.5" />
              Comprobante subido correctamente
            </p>
          </div>
        </div>

        <div class="bg-rose-50 rounded-xl p-4 flex items-center gap-3">
          <Icon icon="lucide:info" class="size-5 text-rose-400 flex-shrink-0" />
          <p class="text-xs text-rose-600">Tu pago quedará en estado <strong>pendiente</strong> hasta que un administrador lo apruebe. Recibirás acceso automáticamente al ser aprobado.</p>
        </div>

        <p v-if="errorPago" class="text-sm text-red-500">{{ errorPago }}</p>
        <p v-if="okPago" class="text-sm text-green-600 font-medium">{{ okPago }}</p>

        <div class="flex gap-3">
          <button @click="planSeleccionado = null" class="flex-1 py-2.5 border border-default-200 rounded-xl text-sm text-default-600 hover:bg-default-50 transition-colors">
            Cancelar
          </button>
          <button @click="registrarPago" :disabled="loadingPago"
            class="flex-1 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 disabled:opacity-50 transition-colors">
            {{ loadingPago ? 'Registrando...' : 'Registrar pago' }}
          </button>
        </div>
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

const planes = ref<any[]>([])
const suscripciones = ref<any[]>([])
const pagos = ref<any[]>([])
const loadingPlanes = ref(true)
const planSeleccionado = ref<any>(null)
const loadingPago = ref(false)
const errorPago = ref('')
const okPago = ref('')

const inputComprobante = ref<HTMLInputElement | null>(null)
const archivoComprobante = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const uploadError = ref('')

const formPago = ref({
  tipo_periodo: 'mensual',
  metodo_pago: 'transferencia',
  comprobante_url: '',
})

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) procesarArchivo(file)
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) procesarArchivo(file)
}

function procesarArchivo(file: File) {
  uploadError.value = ''
  const maxSize = 5 * 1024 * 1024
  const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf']
  if (!allowed.includes(file.type)) {
    uploadError.value = 'Formato no permitido. Usa PNG, JPG, GIF, WEBP o PDF.'
    return
  }
  if (file.size > maxSize) {
    uploadError.value = 'El archivo supera el límite de 5 MB.'
    return
  }
  archivoComprobante.value = file
  formPago.value.comprobante_url = ''
  if (file.type.startsWith('image/')) {
    previewUrl.value = URL.createObjectURL(file)
  } else {
    previewUrl.value = null
  }
}

function limpiarArchivo() {
  archivoComprobante.value = null
  previewUrl.value = null
  formPago.value.comprobante_url = ''
  uploadError.value = ''
  if (inputComprobante.value) inputComprobante.value.value = ''
}

async function subirComprobante(): Promise<string | null> {
  if (!archivoComprobante.value) return formPago.value.comprobante_url || null
  const fd = new FormData()
  fd.append('file', archivoComprobante.value)
  const res = await auth.authFetch(`${API}/suscripciones/upload-comprobante`, {
    method: 'POST',
    body: fd,
  })
  if (!res.ok) {
    const e = await res.json()
    throw new Error(e.error ?? 'Error al subir comprobante')
  }
  const data = await res.json()
  return data.url
}

async function cargarPlanes() {
  loadingPlanes.value = true
  try {
    const res = await fetch(`${API}/suscripciones/planes`)
    if (res.ok) planes.value = await res.json()
  } finally {
    loadingPlanes.value = false
  }
}

async function cargarSuscripciones() {
  try {
    const res = await auth.authFetch(`${API}/suscripciones/mis-suscripciones`)
    if (res.ok) suscripciones.value = await res.json()
  } catch {}
}

async function cargarPagos() {
  try {
    const res = await auth.authFetch(`${API}/pagos/historial`)
    if (res.ok) pagos.value = await res.json()
  } catch {}
}

function seleccionarPlan(plan: any) {
  planSeleccionado.value = planSeleccionado.value?.id === plan.id ? null : plan
  errorPago.value = ''
  okPago.value = ''
  limpiarArchivo()
}

async function registrarPago() {
  errorPago.value = ''
  okPago.value = ''
  loadingPago.value = true
  try {
    // Subir comprobante primero si hay archivo
    let comprobanteUrl: string | null = null
    try {
      comprobanteUrl = await subirComprobante()
    } catch (e: any) {
      errorPago.value = e.message
      return
    }

    const res = await auth.authFetch(`${API}/suscripciones/pago`, {
      method: 'POST',
      body: JSON.stringify({
        plan_id: planSeleccionado.value.id,
        tipo_periodo: formPago.value.tipo_periodo,
        metodo_pago: formPago.value.metodo_pago,
        comprobante_url: comprobanteUrl ?? undefined,
      }),
    })
    if (!res.ok) {
      const e = await res.json()
      errorPago.value = e.message ?? 'Error al registrar pago'
      return
    }
    okPago.value = 'Pago registrado correctamente. Esperando aprobacion del administrador.'
    planSeleccionado.value = null
    limpiarArchivo()
    cargarSuscripciones()
    cargarPagos()
  } finally {
    loadingPago.value = false
  }
}

onMounted(() => {
  cargarPlanes()
  cargarSuscripciones()
  cargarPagos()
})
</script>
