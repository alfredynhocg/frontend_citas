import { Router } from 'express';
import QRCode from 'qrcode';
import multer from 'multer';
import { getStatus, getQr, sendMessage, sendMediaMessage, disconnect } from '../bot.js';
import { listConversaciones, getMensajes, getAllPhones, marcarAtendido, getConversacion, logMensaje } from '../store.js';
import { setConfig, getConfig } from '../agent.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/status', (_req, res) => res.json(getStatus()));

router.get('/qr', async (_req, res) => {
  const qr = getQr();
  if (!qr) return res.status(404).json({ message: 'No hay QR disponible.' });
  try {
    const dataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
    res.json({ qr: dataUrl });
  } catch {
    res.status(500).json({ message: 'Error al generar QR' });
  }
});

router.post('/disconnect', async (_req, res) => {
  try { await disconnect(); res.json({ message: 'Desconectado' }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/conversaciones', async (req, res) => {
  try {
    const { query = '', estado = '', pageIndex = 1, pageSize = 15 } = req.query;
    const result = await listConversaciones({ query, estado, page: parseInt(pageIndex), pageSize: parseInt(pageSize) });
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/conversaciones/:phone/mensajes', async (req, res) => {
  try {
    const { phone } = req.params;
    const conv = await getConversacion(phone);
    if (!conv) return res.status(404).json({ message: 'Conversación no encontrada' });
    const mensajes = await getMensajes(phone);
    res.json({ data: mensajes, phone: conv.phone, nombre: conv.nombre, estado: conv.estado });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/conversaciones/:phone/atendido', async (req, res) => {
  try {
    await marcarAtendido(req.params.phone);
    res.json({ message: 'Marcado como atendido' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/enviar', async (req, res) => {
  const { phone, mensaje } = req.body;
  if (!phone || !mensaje) return res.status(422).json({ message: 'Se requiere phone y mensaje' });
  try {
    await sendMessage(phone, mensaje);
    await logMensaje(phone, 'saliente', 'text', mensaje);
    res.json({ message: 'Mensaje enviado' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/enviar-masivo', async (req, res) => {
  const { phones, mensaje } = req.body;
  if (!phones?.length || !mensaje) return res.status(422).json({ message: 'Se requieren phones y mensaje' });
  let exitosos = 0; const fallidos = [];
  for (const phone of phones) {
    try { await sendMessage(phone, mensaje); await logMensaje(phone, 'saliente', 'text', mensaje); exitosos++; }
    catch (err) { fallidos.push({ phone, error: err.message }); }
  }
  res.json({ exitosos, fallidos: fallidos.length, detalle_fallidos: fallidos });
});

router.post('/enviar-media', upload.single('archivo'), async (req, res) => {
  const { phones, tipo, caption = '' } = req.body;
  const archivo = req.file;
  if (!phones || !archivo) return res.status(422).json({ message: 'Se requieren phones y archivo' });
  const phoneList = Array.isArray(phones) ? phones : [phones];
  let exitosos = 0; const fallidos = [];
  for (const phone of phoneList) {
    try {
      await sendMediaMessage(phone, tipo, archivo.buffer, archivo.mimetype, caption, archivo.originalname);
      await logMensaje(phone, 'saliente', tipo, caption || `[${tipo}]`);
      exitosos++;
    } catch (err) { fallidos.push({ phone, error: err.message }); }
  }
  res.json({ exitosos, fallidos: fallidos.length, detalle_fallidos: fallidos });
});

router.get('/phones', async (_req, res) => {
  try { res.json({ phones: await getAllPhones() }); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/ia/config', (_req, res) => res.json(getConfig()));

router.post('/ia/config', (req, res) => {
  try {
    setConfig(req.body);
    res.json({ message: 'Configuración actualizada' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

export default router;
