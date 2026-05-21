<template>
  <div class="relative flex min-h-screen w-full overflow-hidden">

    <img :src="authBg" alt="" class="absolute inset-0 w-full h-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-br from-rose-950/80 via-slate-950/85 to-indigo-950/80" />

    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <span v-for="p in particles" :key="p.id"
        class="absolute text-rose-300/20 select-none animate-float"
        :style="p.style">♥</span>
    </div>

    <div class="relative z-10 flex w-full min-h-screen items-stretch">

      <div class="flex flex-col justify-center
                  w-full sm:max-w-[460px] lg:max-w-[500px]
                  mx-auto sm:mx-0
                  px-8 sm:px-12 lg:px-14
                  py-14
                  sm:m-6 lg:m-8
                  sm:rounded-3xl
                  bg-white/[0.07] backdrop-blur-2xl
                  border-0 sm:border border-white/[0.12]
                  sm:shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]">

        <div class="flex items-center gap-2.5 mb-10">
          <div class="size-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-900/50">
            <Icon icon="lucide:heart" class="size-4 text-white" />
          </div>
          <span class="text-white/80 font-medium text-sm tracking-wide">100 Citas Románticas</span>
        </div>

        <div class="mb-9">
          <h1 class="text-[2.6rem] font-bold text-white leading-[1.1] tracking-tight mb-3">
            Hola,<br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-pink-300 to-rose-400">
              bienvenido
            </span>
          </h1>
          <p class="text-white/40 text-[15px]">
            La Paz te espera. Ingresa para continuar.
          </p>
        </div>

        <transition name="slide-down">
          <div v-if="expired"
            class="flex items-center gap-3 rounded-2xl bg-amber-500/10 border border-amber-400/20
                   px-4 py-3 text-sm text-amber-200/90 mb-5">
            <Icon icon="lucide:clock" class="size-4 flex-shrink-0 text-amber-400" />
            Tu sesión expiró. Vuelve a ingresar.
          </div>
        </transition>

        <form class="space-y-4" @submit.prevent="handleLogin" novalidate>

          <div class="space-y-1.5">
            <label class="text-[11px] font-semibold text-white/40 uppercase tracking-[0.12em]">
              Correo electrónico
            </label>
            <div class="relative">
              <Icon icon="lucide:mail"
                class="absolute left-4 top-1/2 -translate-y-1/2 size-4 pointer-events-none transition-colors duration-200"
                :class="emailFocused ? 'text-rose-300' : 'text-white/25'" />
              <input
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="tu@correo.com"
                @focus="emailFocused = true"
                @blur="emailFocused = false; emailTouched = true"
                class="w-full rounded-2xl pl-11 pr-4 py-3.5 text-[15px] text-white
                       placeholder-white/20 outline-none transition-all duration-200
                       border bg-white/[0.06]"
                :class="emailError
                  ? 'border-red-400/50 focus:border-red-400/70 focus:ring-1 focus:ring-red-400/20'
                  : emailFocused
                    ? 'border-rose-400/50 bg-white/[0.09] ring-1 ring-rose-400/20'
                    : 'border-white/[0.1] hover:border-white/20'"
              />
            </div>
            <transition name="fade">
              <p v-if="emailError" class="text-xs text-red-300/80 pl-1 flex items-center gap-1">
                <Icon icon="lucide:circle-alert" class="size-3" />{{ emailError }}
              </p>
            </transition>
          </div>

          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-[11px] font-semibold text-white/40 uppercase tracking-[0.12em]">
                Contraseña
              </label>
              <RouterLink to="/mordern-auth/reset-pass"
                class="text-[11px] text-rose-300/50 hover:text-rose-300/80 transition-colors">
                ¿La olvidaste?
              </RouterLink>
            </div>
            <div class="relative">
              <Icon icon="lucide:lock"
                class="absolute left-4 top-1/2 -translate-y-1/2 size-4 pointer-events-none transition-colors duration-200"
                :class="passFocused ? 'text-rose-300' : 'text-white/25'" />
              <input
                v-model="password"
                :type="showPass ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="••••••••••"
                @focus="passFocused = true"
                @blur="passFocused = false; passTouched = true"
                class="w-full rounded-2xl pl-11 pr-12 py-3.5 text-[15px] text-white
                       placeholder-white/20 outline-none transition-all duration-200
                       border bg-white/[0.06]"
                :class="passError
                  ? 'border-red-400/50 focus:border-red-400/70 focus:ring-1 focus:ring-red-400/20'
                  : passFocused
                    ? 'border-rose-400/50 bg-white/[0.09] ring-1 ring-rose-400/20'
                    : 'border-white/[0.1] hover:border-white/20'"
              />
              <button type="button" tabindex="-1"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                @click="showPass = !showPass">
                <Icon :icon="showPass ? 'lucide:eye-off' : 'lucide:eye'" class="size-4" />
              </button>
            </div>
            <transition name="fade">
              <p v-if="passError" class="text-xs text-red-300/80 pl-1 flex items-center gap-1">
                <Icon icon="lucide:circle-alert" class="size-3" />{{ passError }}
              </p>
            </transition>
          </div>

          <transition name="slide-down">
            <div v-if="errorMsg"
              class="flex items-center gap-3 rounded-2xl bg-red-500/10 border border-red-400/20
                     px-4 py-3 text-sm text-red-200/90">
              <Icon icon="lucide:alert-circle" class="size-4 flex-shrink-0 text-red-400" />
              {{ errorMsg }}
            </div>
          </transition>

          <div class="pt-2">
            <button
              type="submit"
              :disabled="loading"
              class="relative w-full py-4 rounded-2xl font-semibold text-[15px] text-white
                     transition-all duration-200 active:scale-[0.985]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50
                     bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500
                     shadow-xl shadow-rose-900/40 hover:shadow-rose-900/60
                     overflow-hidden"
            >
              <span class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                           -translate-x-full hover:translate-x-full transition-transform duration-700" />
              <span class="relative flex items-center justify-center gap-2">
                <Icon v-if="loading" icon="lucide:loader-circle" class="size-5 animate-spin" />
                <Icon v-else icon="lucide:heart" class="size-4" />
                {{ loading ? 'Ingresando…' : 'Iniciar sesión' }}
              </span>
            </button>
          </div>

        </form>

        <div class="mt-8 pt-6 border-t border-white/[0.07] text-center">
          <p class="text-[13px] text-white/35">
            ¿Primera vez aquí?
            <RouterLink to="/mordern-auth/register"
              class="text-rose-300/70 hover:text-rose-300 font-medium ml-1 transition-colors underline underline-offset-2 decoration-rose-400/30">
              Crea tu cuenta
            </RouterLink>
          </p>
          <p class="text-[11px] text-white/20 mt-3">
            &copy; {{ year }} 100 Citas Románticas · La Paz, Bolivia
          </p>
        </div>

      </div>

      <div class="hidden lg:flex flex-1 flex-col items-center justify-center px-16 xl:px-24 text-white">
        <div class="max-w-md w-full space-y-10">

          <div class="space-y-4">
            <div class="flex items-center gap-2 text-rose-300/60 text-sm">
              <Icon icon="lucide:quote" class="size-4" />
              <span class="uppercase tracking-widest text-[11px] font-medium">Pensamiento del día</span>
            </div>
            <transition name="quote-fade" mode="out-in">
              <blockquote :key="quoteIdx" class="text-2xl xl:text-3xl font-light text-white/85 leading-relaxed italic">
                "{{ quotes[quoteIdx] }}"
              </blockquote>
            </transition>
          </div>

          <div class="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          <div>
            <p class="text-[11px] text-white/30 uppercase tracking-widest mb-4">Experiencias en La Paz</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="cat in categories" :key="cat.label"
                class="flex items-center gap-2 px-4 py-2 rounded-full text-[13px]
                       text-white/70 bg-white/[0.06] border border-white/[0.1]
                       hover:bg-rose-500/10 hover:border-rose-400/20 hover:text-rose-200
                       transition-all duration-300 cursor-default">
                <Icon :icon="cat.icon" class="size-3.5" />
                {{ cat.label }}
              </span>
            </div>
          </div>

          <div class="flex gap-10">
            <div v-for="stat in stats" :key="stat.label" class="space-y-1">
              <p class="text-4xl font-bold text-white">{{ stat.value }}</p>
              <p class="text-[11px] text-white/30 uppercase tracking-widest">{{ stat.label }}</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { Icon } from '@iconify/vue'
import authBg from '@/assets/images/hr-dashboard.png'
import { useAuthStore } from '@/stores/auth'

const router    = useRouter()
const route     = useRoute()
const authStore = useAuthStore()

const year    = new Date().getFullYear()
const expired = computed(() => route.query.expired === '1')

const email    = ref('')
const password = ref('')
const showPass  = ref(false)
const loading   = ref(false)
const errorMsg  = ref('')

const emailFocused = ref(false)
const passFocused  = ref(false)
const emailTouched = ref(false)
const passTouched  = ref(false)

const emailError = computed(() => {
  if (!emailTouched.value || !email.value) return ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '' : 'Ingresa un email válido'
})
const passError = computed(() => {
  if (!passTouched.value || !password.value) return ''
  return password.value.length >= 4 ? '' : 'Mínimo 4 caracteres'
})

const particles = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  style: {
    left:             `${8 + i * 8}%`,
    top:              `${10 + (i % 5) * 18}%`,
    fontSize:         `${14 + (i % 4) * 10}px`,
    animationDelay:   `${i * 0.9}s`,
    animationDuration:`${6 + (i % 4) * 2}s`,
  },
}))

const quotes = [
  'El amor no se mira, se vive juntos en cada rincón de la ciudad.',
  'Cada calle de La Paz guarda una historia esperando ser contada por dos.',
  'Los mejores recuerdos no se planean, simplemente suceden.',
  'Amar es descubrir el mundo con los ojos del otro.',
  'Una ciudad entera para dos personas que quieren encontrarse.',
]
const quoteIdx = ref(0)
let quoteTimer: ReturnType<typeof setInterval>

onMounted(() => {
  quoteTimer = setInterval(() => {
    quoteIdx.value = (quoteIdx.value + 1) % quotes.length
  }, 5000)
})
onUnmounted(() => clearInterval(quoteTimer))

const categories = [
  { icon: 'lucide:utensils', label: 'Gastronomía' },
  { icon: 'lucide:mountain', label: 'Naturaleza'  },
  { icon: 'lucide:landmark', label: 'Cultura'     },
  { icon: 'lucide:moon',     label: 'Noche'       },
  { icon: 'lucide:palette',  label: 'Arte'        },
  { icon: 'lucide:camera',   label: 'Recuerdos'   },
]

const stats = [
  { value: '100', label: 'Citas'      },
  { value: '10+', label: 'Categorías' },
  { value: '∞',   label: 'Recuerdos' },
]

async function handleLogin() {
  emailTouched.value = true
  passTouched.value  = true
  if (emailError.value || passError.value) return
  errorMsg.value = ''
  loading.value  = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard/citas')
  } catch (e: unknown) {
    errorMsg.value = e instanceof Error ? e.message : 'Credenciales incorrectas'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(-5deg); opacity: 0.15; }
  50%       { transform: translateY(-24px) rotate(5deg); opacity: 0.35; }
}
.animate-float { animation: float linear infinite; }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-3px); }

.slide-down-enter-active, .slide-down-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease, max-height 0.25s ease;
  max-height: 80px; overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to {
  opacity: 0; transform: translateY(-6px); max-height: 0;
}

.quote-fade-enter-active, .quote-fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.quote-fade-enter-from { opacity: 0; transform: translateY(10px); }
.quote-fade-leave-to   { opacity: 0; transform: translateY(-10px); }
</style>
