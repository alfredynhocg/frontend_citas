<template>
  <Vertical>
    <div class="p-4 sm:p-6 h-full flex flex-col gap-4" style="min-height: calc(100vh - 80px)">

      <div>
        <h1 class="text-2xl font-bold text-default-900">Mensajes</h1>
        <p class="text-sm text-default-500 mt-0.5">Chat con tu grupo.</p>
      </div>

      <div v-if="grupos.length > 1" class="flex gap-2 flex-wrap">
        <button v-for="g in grupos" :key="g.id" @click="seleccionarGrupo(g)"
          class="px-3 py-1.5 rounded-xl text-sm font-medium transition-colors"
          :class="grupoActivo?.id === g.id ? 'bg-rose-500 text-white' : 'bg-default-100 text-default-600 hover:bg-default-200'">
          {{ g.nombre }}
        </button>
      </div>

      <div v-if="grupoActivo" class="card flex flex-col flex-1 overflow-hidden" style="min-height: 400px">

        <div class="px-4 py-3 border-b border-default-100 flex items-center gap-3">
          <div class="size-9 rounded-xl bg-rose-100 flex items-center justify-center">
            <Icon icon="lucide:users" class="size-4 text-rose-500" />
          </div>
          <div>
            <p class="font-semibold text-sm text-default-900">{{ grupoActivo.nombre }}</p>
            <p class="text-xs text-default-400">{{ mensajes.length }} mensajes</p>
          </div>
        </div>

        <div ref="chatBox" class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-if="loadingMensajes" class="flex justify-center py-8">
            <Icon icon="lucide:loader-circle" class="size-6 animate-spin text-rose-400" />
          </div>
          <div v-else-if="!mensajes.length" class="flex flex-col items-center justify-center py-12 text-center space-y-2">
            <Icon icon="lucide:message-circle" class="size-10 text-default-200" />
            <p class="text-sm text-default-400">Sin mensajes aún. ¡Sé el primero!</p>
          </div>
          <template v-else>
            <div v-for="m in mensajes" :key="m.id"
              class="flex gap-2"
              :class="esMio(m) ? 'flex-row-reverse' : 'flex-row'">
              <div class="size-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold"
                :class="esMio(m) ? 'bg-rose-100 text-rose-600' : 'bg-default-100 text-default-600'">
                {{ initials(m.de_usuario) }}
              </div>
              <div class="max-w-[70%] space-y-0.5">
                <p v-if="!esMio(m)" class="text-[10px] text-default-400 px-1">{{ m.de_usuario }}</p>
                <div class="px-3 py-2 rounded-2xl text-sm"
                  :class="esMio(m)
                    ? 'bg-rose-500 text-white rounded-tr-sm'
                    : 'bg-default-100 text-default-900 rounded-tl-sm'">
                  {{ m.mensaje }}
                </div>
                <p class="text-[10px] text-default-300 px-1" :class="esMio(m) ? 'text-right' : ''">{{ formatFecha(m.fecha) }}</p>
              </div>
            </div>
          </template>
        </div>

        <div class="px-4 py-3 border-t border-default-100 flex gap-2">
          <input v-model="nuevoMensaje" @keyup.enter="enviarMensaje" type="text" placeholder="Escribe un mensaje..."
            class="flex-1 border border-default-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
          <button @click="enviarMensaje" :disabled="!nuevoMensaje.trim() || enviando"
            class="px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center gap-1.5">
            <Icon :icon="enviando ? 'lucide:loader-circle' : 'lucide:send'" class="size-4" :class="enviando ? 'animate-spin' : ''" />
          </button>
        </div>

      </div>

      <div v-else-if="!loading && !grupos.length" class="card p-12 text-center space-y-4">
        <div class="size-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto">
          <Icon icon="lucide:message-circle" class="size-8 text-rose-300" />
        </div>
        <div>
          <h3 class="font-semibold text-default-900">Sin grupos</h3>
          <p class="text-sm text-default-400 mt-1">Crea o únete a un grupo para poder chatear.</p>
        </div>
        <router-link to="/grupos" class="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white text-sm font-medium rounded-xl hover:bg-rose-600 transition-colors">
          <Icon icon="lucide:users-round" class="size-4" />
          Ir a Grupos
        </router-link>
      </div>

      <div v-else-if="loading" class="card p-6 animate-pulse space-y-3">
        <div class="h-4 bg-default-100 rounded w-1/3" />
        <div class="h-48 bg-default-50 rounded-xl" />
      </div>

    </div>
  </Vertical>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { Icon } from '@iconify/vue'
import Vertical from '@/layouts/vertical.vue'
import { useAuthStore } from '@/stores/auth'

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'
const auth = useAuthStore()

const grupos = ref<any[]>([])
const grupoActivo = ref<any>(null)
const mensajes = ref<any[]>([])
const loading = ref(true)
const loadingMensajes = ref(false)
const nuevoMensaje = ref('')
const enviando = ref(false)
const chatBox = ref<HTMLElement | null>(null)

function initials(nombre: string) {
  return nombre?.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase() ?? '?'
}

function esMio(m: any) {
  return m.de_usuario_id === auth.user?.id || m.de_usuario === auth.user?.name
}

function formatFecha(fecha: string) {
  const d = new Date(fecha)
  return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

async function cargarGrupos() {
  loading.value = true
  try {
    const res = await auth.authFetch(`${API}/grupos`)
    if (res.ok) {
      grupos.value = await res.json()
      if (grupos.value.length) seleccionarGrupo(grupos.value[0])
    }
  } finally {
    loading.value = false
  }
}

async function seleccionarGrupo(g: any) {
  grupoActivo.value = g
  mensajes.value = []
  loadingMensajes.value = true
  try {
    const res = await auth.authFetch(`${API}/mensajes/grupo/${g.id}`)
    if (res.ok) mensajes.value = await res.json()
  } finally {
    loadingMensajes.value = false
    await nextTick()
    scrollBottom()
  }
}

async function enviarMensaje() {
  const texto = nuevoMensaje.value.trim()
  if (!texto || !grupoActivo.value) return
  enviando.value = true
  try {
    const res = await auth.authFetch(`${API}/mensajes`, {
      method: 'POST',
      body: JSON.stringify({ grupo_id: grupoActivo.value.id, mensaje: texto }),
    })
    if (res.ok) {
      nuevoMensaje.value = ''
      await seleccionarGrupo(grupoActivo.value)
    }
  } finally {
    enviando.value = false
  }
}

function scrollBottom() {
  if (chatBox.value) chatBox.value.scrollTop = chatBox.value.scrollHeight
}

watch(mensajes, async () => {
  await nextTick()
  scrollBottom()
})

onMounted(cargarGrupos)
</script>
