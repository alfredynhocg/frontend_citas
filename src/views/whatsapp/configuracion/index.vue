<template>
  <Vertical>
    <div class="p-4 sm:p-6 space-y-6">

      <div>
        <h1 class="text-2xl font-bold text-default-900">Configuración IA Bot</h1>
        <p class="text-sm text-default-500 mt-0.5">Parámetros de Ollama para las respuestas automáticas del bot.</p>
      </div>

      <div v-if="saving || saved" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium"
        :class="saved ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-amber-50 text-amber-700 border border-amber-200'">
        <Icon :icon="saved ? 'lucide:check-circle-2' : 'lucide:loader-circle'" class="size-4 flex-shrink-0"
          :class="{ 'animate-spin': saving }" />
        {{ saved ? 'Configuración guardada correctamente.' : 'Guardando…' }}
      </div>

      <div v-if="error" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200">
        <Icon icon="lucide:alert-circle" class="size-4 flex-shrink-0" />
        {{ error }}
      </div>

      <div class="card p-6 space-y-5">
        <h2 class="font-semibold text-default-800 text-base flex items-center gap-2">
          <Icon icon="lucide:cpu" class="size-4 text-default-400" /> Ollama
        </h2>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-default-700 mb-1.5">Host de Ollama</label>
            <input v-model="form.ollamaHost" type="text" class="form-input w-full text-sm"
              placeholder="http://localhost:11434" />
            <p class="mt-1 text-xs text-default-400">URL base del servidor Ollama.</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-default-700 mb-1.5">Modelo</label>
            <div class="flex gap-2">
              <input v-model="form.ollamaModel" type="text" class="form-input flex-1 text-sm"
                placeholder="llama3.2" />
              <button @click="verificarOllama" :disabled="verificando"
                class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-default-200 text-sm text-default-600 hover:bg-default-50 transition-colors disabled:opacity-50">
                <Icon :icon="verificando ? 'lucide:loader-circle' : 'lucide:plug'" class="size-3.5"
                  :class="{ 'animate-spin': verificando }" />
                Probar
              </button>
            </div>
            <p v-if="ollamaStatus" class="mt-1 text-xs" :class="ollamaOk ? 'text-green-600' : 'text-red-500'">
              {{ ollamaStatus }}
            </p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-default-700 mb-1.5">
              Temperatura <span class="text-default-400 font-normal">({{ form.temperature }})</span>
            </label>
            <input v-model.number="form.temperature" type="range" min="0" max="1" step="0.05"
              class="w-full accent-green-500" />
            <div class="flex justify-between text-xs text-default-400 mt-0.5">
              <span>Preciso (0)</span><span>Creativo (1)</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-default-700 mb-1.5">
              Máx. tokens <span class="text-default-400 font-normal">({{ form.maxTokens }})</span>
            </label>
            <input v-model.number="form.maxTokens" type="range" min="100" max="1000" step="50"
              class="w-full accent-green-500" />
            <div class="flex justify-between text-xs text-default-400 mt-0.5">
              <span>Corto (100)</span><span>Largo (1000)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card p-6 space-y-4">
        <h2 class="font-semibold text-default-800 text-base flex items-center gap-2">
          <Icon icon="lucide:message-square-text" class="size-4 text-default-400" /> Prompt del sistema
        </h2>
        <p class="text-xs text-default-500">
          Instrucciones extra que se añaden al prompt base del bot. Puedes incluir el tono, restricciones adicionales o información del negocio.
        </p>
        <textarea v-model="form.systemPrompt" rows="6"
          placeholder="Ej: Usa un tono muy romántico y cercano. Cuando el usuario mencione aniversario o sorpresa, adapta tu respuesta a esa ocasión especial. Finaliza cada respuesta con una frase motivadora sobre el amor en La Paz."
          class="form-input w-full text-sm resize-y" />
      </div>

      <div class="card p-6 space-y-4">
        <h2 class="font-semibold text-default-800 text-base flex items-center gap-2">
          <Icon icon="lucide:shield" class="size-4 text-default-400" /> Filtros de seguridad
        </h2>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-default-700">Detección de jailbreak</p>
            <p class="text-xs text-default-400">Bloquea mensajes que intenten manipular el bot.</p>
          </div>
          <button @click="form.jailbreakFilter = !form.jailbreakFilter"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="form.jailbreakFilter ? 'bg-green-500' : 'bg-default-200'">
            <span class="inline-block size-4 rounded-full bg-white shadow transform transition-transform"
              :class="form.jailbreakFilter ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-default-700">Filtro de contexto</p>
            <p class="text-xs text-default-400">Solo responde preguntas relacionadas con citas románticas.</p>
          </div>
          <button @click="form.scopeFilter = !form.scopeFilter"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            :class="form.scopeFilter ? 'bg-green-500' : 'bg-default-200'">
            <span class="inline-block size-4 rounded-full bg-white shadow transform transition-transform"
              :class="form.scopeFilter ? 'translate-x-6' : 'translate-x-1'" />
          </button>
        </div>
      </div>

      <div class="card p-6 space-y-3">
        <h2 class="font-semibold text-default-800 text-base flex items-center gap-2">
          <Icon icon="lucide:activity" class="size-4 text-default-400" /> Rate limiting
        </h2>
        <div class="grid grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-default-700 mb-1.5">Máx. mensajes / minuto</label>
            <input v-model.number="form.rateLimit" type="number" min="1" max="100" class="form-input w-full text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-default-700 mb-1.5">Historial de contexto</label>
            <input v-model.number="form.historySize" type="number" min="2" max="20" class="form-input w-full text-sm" />
            <p class="mt-1 text-xs text-default-400">Turnos de conversación que recuerda el bot.</p>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button @click="resetForm"
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-default-200 text-sm text-default-600 hover:bg-default-50 transition-colors">
          <Icon icon="lucide:rotate-ccw" class="size-4" /> Restablecer
        </button>
        <button @click="guardar" :disabled="saving"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors disabled:opacity-50">
          <Icon :icon="saving ? 'lucide:loader-circle' : 'lucide:save'" class="size-4" :class="{ 'animate-spin': saving }" />
          {{ saving ? 'Guardando…' : 'Guardar cambios' }}
        </button>
      </div>

    </div>
  </Vertical>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import Vertical from '@/layouts/vertical.vue'

const BOT = 'http://localhost:3001'

const DEFAULTS = {
  ollamaHost:    'http://localhost:11434',
  ollamaModel:   'llama3.2',
  temperature:   0.7,
  maxTokens:     400,
  systemPrompt:  '',
  jailbreakFilter: true,
  scopeFilter:   true,
  rateLimit:     20,
  historySize:   8,
}

const STORAGE_KEY = 'wa_ia_config'

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch (_) {}
  return { ...DEFAULTS }
}

const form = reactive(loadStored())

const saving      = ref(false)
const saved       = ref(false)
const error       = ref('')
const verificando = ref(false)
const ollamaStatus = ref('')
const ollamaOk     = ref(false)

async function cargarDesdeBot() {
  try {
    const res = await fetch(`${BOT}/ia/config`, { signal: AbortSignal.timeout(3000) })
    if (res.ok) {
      const d = await res.json()
      Object.assign(form, d)
    }
  } catch (_) {}
}

cargarDesdeBot()

function resetForm() {
  Object.assign(form, DEFAULTS)
  localStorage.removeItem(STORAGE_KEY)
}

async function verificarOllama() {
  verificando.value = true
  ollamaStatus.value = ''
  try {
    const res = await fetch(`${form.ollamaHost}/api/tags`, { signal: AbortSignal.timeout(5000) })
    if (res.ok) {
      const d = await res.json()
      const models: string[] = (d.models ?? []).map((m: any) => m.name)
      const found = models.some(m => m.startsWith(form.ollamaModel))
      ollamaOk.value = found
      ollamaStatus.value = found
        ? `✓ Modelo "${form.ollamaModel}" disponible.`
        : `⚠ Modelo no encontrado. Disponibles: ${models.slice(0, 4).join(', ')}`
    } else {
      ollamaOk.value = false
      ollamaStatus.value = `Error HTTP ${res.status} al conectar con Ollama.`
    }
  } catch {
    ollamaOk.value = false
    ollamaStatus.value = 'No se pudo conectar con Ollama. ¿Está corriendo?'
  } finally {
    verificando.value = false
  }
}

async function guardar() {
  saving.value = true
  saved.value  = false
  error.value  = ''
  try {
    await fetch(`${BOT}/ia/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ollamaHost:      form.ollamaHost,
        ollamaModel:     form.ollamaModel,
        temperature:     form.temperature,
        maxTokens:       form.maxTokens,
        systemPrompt:    form.systemPrompt,
        jailbreakFilter: form.jailbreakFilter,
        scopeFilter:     form.scopeFilter,
        rateLimit:       form.rateLimit,
        historySize:     form.historySize,
      }),
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...form }))
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch {
    error.value = 'No se pudo guardar la configuración. Asegúrate de que el bot esté corriendo.'
  } finally {
    saving.value = false
  }
}
</script>
