import 'dotenv/config';
import { getPool } from './store.js';

let config = {
  ollamaHost:      process.env.OLLAMA_HOST        || 'http://localhost:11434',
  ollamaModel:     process.env.OLLAMA_MODEL       || 'llama3.2',
  temperature:     parseFloat(process.env.OLLAMA_TEMPERATURE || '0.7'),
  maxTokens:       parseInt(process.env.OLLAMA_MAX_TOKENS    || '400'),
  systemPrompt:    process.env.OLLAMA_SYSTEM_PROMPT ||
    'Tono: cálido, romántico y cercano, como un amigo que conoce muy bien La Paz. ' +
    'Cuando recomiendes una cita, menciona qué hace especial ese lugar para una pareja. ' +
    'Si el usuario busca algo para aniversario, primera cita o sorpresa, adapta tu respuesta a esa ocasión. ' +
    'Nunca inventes precios, horarios ni teléfonos; si no tienes esa información, indica que escriba *soporte*. ' +
    'Finaliza cada respuesta con una pequeña frase motivadora romántica relacionada con La Paz o Bolivia.',
  jailbreakFilter: true,
  scopeFilter:     true,
  rateLimit:       20,
  historySize:     8,
};

export function getConfig() { return { ...config }; }
export function setConfig(updates) {
  const allowed = ['ollamaHost','ollamaModel','temperature','maxTokens','systemPrompt','jailbreakFilter','scopeFilter','rateLimit','historySize'];
  for (const key of allowed) {
    if (key in updates) config[key] = updates[key];
  }
}

const rateLimitMap = new Map();
const RATE_WINDOW  = 60_000;

const FORBIDDEN = [
  'ignora', 'olvida', 'instruccion', 'instrucción', 'prompt', 'sistema',
  'jailbreak', 'bypass', 'hack', 'inyecta', 'override', 'actúa como',
  'actua como', 'finge ser', 'pretende ser', 'eres ahora',
];

const IN_SCOPE = [
  'cita', 'citas', 'romantica', 'romántica', 'pareja', 'amor', 'la paz',
  'restaurante', 'lugar', 'actividad', 'plan', 'salida', 'noche', 'especial',
  'categoria', 'categoría', 'precio', 'costo', 'reserva', 'reservar',
  'mirador', 'museo', 'naturaleza', 'gastronomia', 'gastronomía',
  'recomenda', 'sugier', 'dónde', 'donde', 'cuánto', 'cuanto', 'qué hay',
  'que hay', 'negocio', 'dirección', 'direccion', 'ubicación', 'ubicacion',
];

const historialMap = new Map();

function checkRate(phone) {
  const now = Date.now();
  const entry = rateLimitMap.get(phone) ?? { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_WINDOW) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count++;
  rateLimitMap.set(phone, entry);
  return entry.count <= config.rateLimit;
}

function isJailbreak(text) {
  if (!config.jailbreakFilter) return false;
  const lower = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return FORBIDDEN.some(w => lower.includes(w));
}

function isInScope(text) {
  if (!config.scopeFilter) return true;
  const lower = text.toLowerCase();
  return IN_SCOPE.some(w => lower.includes(w));
}

async function buildContext() {
  const db = getPool();
  try {
    const [cats] = await db.query(
      `SELECT cat.nombre, COUNT(c.id) AS total
       FROM categorias cat
       LEFT JOIN citas c ON c.categoria_id = cat.id AND c.activo = 1
       GROUP BY cat.id, cat.nombre ORDER BY cat.nombre`
    );
    const [muestra] = await db.query(
      `SELECT c.nombre, c.descripcion, c.direccion, c.puntos,
              cat.nombre AS categoria, n.nombre AS negocio
       FROM citas c
       LEFT JOIN categorias cat ON c.categoria_id = cat.id
       LEFT JOIN negocios n ON c.negocio_id = n.id
       WHERE c.activo = 1
       ORDER BY RAND() LIMIT 12`
    );

    const catTexto = cats.map(c => `• ${c.nombre} (${c.total} citas)`).join('\n');
    const citasTexto = muestra.map(c =>
      `- ${c.nombre} [${c.categoria ?? 'General'}] — ${c.direccion ?? 'La Paz'}${c.negocio ? ` (${c.negocio})` : ''}`
    ).join('\n');

    return { catTexto, citasTexto };
  } catch {
    return { catTexto: '', citasTexto: '' };
  }
}

function buildSystemPrompt(ctx) {
  let prompt =
    `Eres el asistente virtual de *100 Citas Románticas en La Paz*, una guía de experiencias románticas en Bolivia. ` +
    `Tu misión es ayudar a parejas a descubrir experiencias únicas: restaurantes, miradores, museos, naturaleza, cultura y más. ` +
    `Responde siempre en español, de forma cálida, breve y entusiasta. Usa emojis con moderación. ` +
    `Si el usuario pregunta algo fuera del contexto romántico/turístico de La Paz, redirige amablemente a las citas. ` +
    `No inventes precios ni datos; si no sabes algo, sugiere escribir *soporte* para hablar con un asesor.\n\n`;

  if (ctx.catTexto) {
    prompt += `Categorías disponibles:\n${ctx.catTexto}\n\n`;
  }
  if (ctx.citasTexto) {
    prompt += `Ejemplos de citas disponibles:\n${ctx.citasTexto}\n\n`;
  }

  prompt +=
    `Comandos útiles que el usuario puede escribir: *menu* (menú principal), *citas* (explorar), ` +
    `*categorías* (ver por tipo), *soporte* (asesor humano).\n`;

  if (config.systemPrompt) prompt += `\n${config.systemPrompt}`;
  return prompt;
}

async function logIA(phone, userInput, respuesta, modelo) {
  try {
    await getPool().query(
      `INSERT INTO whatsapp_ia_logs (phone, user_input, respuesta, modelo, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [phone, userInput.slice(0, 1000), respuesta.slice(0, 2000), modelo]
    );
  } catch (_) {}
}

export async function responder(phone, userInput) {
  if (!checkRate(phone)) {
    return '⚠️ Estás enviando muchos mensajes. Por favor espera un momento antes de continuar.';
  }

  if (isJailbreak(userInput)) {
    return '🚫 No puedo procesar ese tipo de mensaje. Escribe *menu* para ver las opciones disponibles.';
  }

  if (!isInScope(userInput)) {
    return (
      `No entendí bien tu pregunta 😊\n\n` +
      `Puedo ayudarte a encontrar citas románticas en La Paz. ` +
      `Escribe:\n• *menu* — ver opciones\n• *citas* — explorar citas\n• *soporte* — hablar con un asesor`
    );
  }

  const ctx = await buildContext();
  const systemPrompt = buildSystemPrompt(ctx);

  const history = historialMap.get(phone) ?? [];
  history.push({ role: 'user', content: userInput });
  if (history.length > config.historySize) history.splice(0, history.length - config.historySize);

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
  ];

  let respuesta = '';
  try {
    const res = await fetch(`${config.ollamaHost}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.ollamaModel,
        messages,
        stream: false,
        options: { temperature: config.temperature, num_predict: config.maxTokens },
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    respuesta = data.message?.content?.trim() ?? '';
  } catch (err) {
    console.error('[Agent] Ollama error:', err.message);
    return '😔 No pude procesar tu pregunta ahora. Escribe *menu* para continuar o *soporte* para hablar con un asesor.';
  }

  if (!respuesta) {
    return '😔 No pude generar una respuesta. Escribe *menu* para ver las opciones.';
  }

  history.push({ role: 'assistant', content: respuesta });
  if (history.length > config.historySize) history.splice(0, history.length - config.historySize);
  historialMap.set(phone, history);

  await logIA(phone, userInput, respuesta, config.ollamaModel);
  return respuesta;
}
