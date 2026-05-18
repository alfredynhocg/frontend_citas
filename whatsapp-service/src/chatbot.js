import { getOrCreateConversacion, setState, logMensaje } from './store.js';
import { extractText, phone, sendText } from './utils/wa.js';
import { sendMenu, handleNumericInput } from './handlers/menu.js';
import { showCategorias } from './handlers/citas.js';
import { handleSoporte } from './handlers/misc.js';
import { responder as agentResponder } from './agent.js';

const MENU_TRIGGERS = ['0', 'menu', 'menú', 'inicio', 'volver', 'start', 'hola', 'hi', 'buenas'];

const KEYWORD_MAP = [
  { words: ['cita', 'citas', 'romántica', 'romantica', 'explorar', 'ver'],  action: 'citas' },
  { words: ['categoría', 'categoria', 'categorías', 'categorias', 'tipo'],  action: 'categorias' },
  { words: ['soporte', 'asesor', 'ayuda', 'humano', 'persona', 'contacto'], action: 'soporte' },
  { words: ['qué es', 'que es', 'información', 'informacion', 'info'],      action: 'info' },
  { words: ['la paz', 'bolivia', 'romántico', 'romantico', 'pareja'],       action: 'citas' },
];

export async function handleMessage(sock, msg) {
  const jid = msg.key.remoteJid;
  const from = phone(jid);
  const text = extractText(msg);
  const nombre = msg.pushName ?? null;

  let conv;
  try {
    conv = await getOrCreateConversacion(from, nombre);
  } catch (err) {
    console.error('[Bot] Error BD:', err.message);
    await sendText(sock, jid, '⚠️ Error interno. Intenta de nuevo en un momento.');
    return;
  }

  const estado = conv.estado ?? 'menu';
  const contexto = typeof conv.contexto === 'string'
    ? JSON.parse(conv.contexto ?? '{}')
    : (conv.contexto ?? {});

  try { await logMensaje(from, 'entrante', 'text', text); } catch (_) {}
  try { await sock.readMessages([msg.key]); } catch (_) {}

  try {
    await _dispatch(sock, jid, from, text, nombre, estado, contexto);
  } catch (err) {
    console.error('[Bot] Error procesando mensaje:', err.message);
    try {
      await sendText(sock, jid, '⚠️ Ocurrió un error. Escribe *menu* para continuar.');
    } catch (_) {}
  }
}

async function _dispatch(sock, jid, from, text, nombre, estado, contexto) {
  if (estado === 'soporte') {
    const intentos = (contexto.soporte_intentos ?? 0) + 1;
    if (intentos >= 3) {
      await sendText(sock, jid,
        `⚠️ Por el momento no hay asesores disponibles.\n\nEscribe *menu* para continuar explorando citas románticas. 💕`
      );
      await setState(from, 'menu', {});
      return;
    }
    await setState(from, 'soporte', { soporte_intentos: intentos });
    await sendText(sock, jid,
      intentos === 1
        ? '📩 Tu mensaje fue recibido. Un asesor te contactará pronto. 💕'
        : '📩 Seguimos esperando un asesor disponible. Gracias por tu paciencia.'
    );
    return;
  }

  if (MENU_TRIGGERS.includes(text.toLowerCase())) {
    await sendMenu(sock, jid, nombre);
    return;
  }

  if (!text) {
    await sendMenu(sock, jid, nombre);
    return;
  }

  if (/^\d+$/.test(text)) {
    await handleNumericInput(sock, jid, text, estado, contexto);
    return;
  }

  const textLower = text.toLowerCase();

  for (const { words, action } of KEYWORD_MAP) {
    if (words.some(w => textLower.includes(w))) {
      if (action === 'citas' || action === 'categorias') {
        await showCategorias(sock, jid);
        return;
      }
      if (action === 'soporte') {
        await handleSoporte(sock, jid);
        return;
      }
      if (action === 'info') {
        await sendText(sock, jid,
          `💕 *100 Citas Románticas en La Paz*\n\n` +
          `Una guía de 100 experiencias románticas únicas para vivir con tu pareja en La Paz, Bolivia. ` +
          `Gastronomía, naturaleza, cultura, arte y más.\n\n` +
          `Escribe *citas* para empezar a explorar o *menu* para ver todas las opciones.`
        );
        return;
      }
    }
  }

  let respuesta;
  try {
    respuesta = await agentResponder(from, text);
  } catch {
    respuesta = null;
  }

  if (respuesta) {
    await sendText(sock, jid, respuesta);
    return;
  }

  await sendText(sock, jid,
    `No entendí bien tu mensaje 😊\n\n` +
    `Puedes escribir:\n• *menu* — ver todas las opciones\n• *citas* — explorar citas románticas\n• *soporte* — hablar con un asesor`
  );
}
