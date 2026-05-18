import 'dotenv/config';
import mysql from 'mysql2/promise';

let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_DATABASE || 'citas_romanticas',
      user:     process.env.DB_USER     || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function testConnection() {
  const conn = await getPool().getConnection();
  await conn.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_conversaciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phone VARCHAR(50) NOT NULL UNIQUE,
      nombre VARCHAR(150) NULL,
      estado VARCHAR(50) NOT NULL DEFAULT 'menu',
      contexto JSON NULL,
      created_at DATETIME NOT NULL DEFAULT NOW(),
      updated_at DATETIME NOT NULL DEFAULT NOW(),
      INDEX idx_estado (estado),
      INDEX idx_updated (updated_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_mensajes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phone VARCHAR(50) NOT NULL,
      direccion ENUM('entrante','saliente') NOT NULL,
      tipo VARCHAR(30) NOT NULL DEFAULT 'text',
      contenido TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT NOW(),
      INDEX idx_phone (phone),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await conn.query(`
    CREATE TABLE IF NOT EXISTS whatsapp_ia_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      phone VARCHAR(50) NOT NULL,
      user_input TEXT NULL,
      respuesta TEXT NULL,
      modelo VARCHAR(100) NULL,
      created_at DATETIME NOT NULL DEFAULT NOW(),
      INDEX idx_phone (phone),
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  conn.release();
  console.log('[DB] Conexión a MySQL exitosa —', process.env.DB_DATABASE);
}

export async function getOrCreateConversacion(phone, nombre = null) {
  const db = getPool();
  const [rows] = await db.query(
    'SELECT * FROM whatsapp_conversaciones WHERE phone = ? LIMIT 1', [phone]
  );
  if (rows.length > 0) {
    if (nombre && !rows[0].nombre) {
      await db.query('UPDATE whatsapp_conversaciones SET nombre = ?, updated_at = NOW() WHERE phone = ?', [nombre, phone]);
      rows[0].nombre = nombre;
    }
    return rows[0];
  }
  await db.query(
    'INSERT INTO whatsapp_conversaciones (phone, nombre, estado, contexto, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
    [phone, nombre, 'menu', '{}']
  );
  const [nuevo] = await db.query('SELECT * FROM whatsapp_conversaciones WHERE phone = ? LIMIT 1', [phone]);
  return nuevo[0];
}

export async function getConversacion(phone) {
  const [rows] = await getPool().query(
    'SELECT * FROM whatsapp_conversaciones WHERE phone = ? LIMIT 1', [phone]
  );
  return rows[0] ?? null;
}

export async function setState(phone, estado, contexto = {}) {
  await getPool().query(
    'UPDATE whatsapp_conversaciones SET estado = ?, contexto = ?, updated_at = NOW() WHERE phone = ?',
    [estado, JSON.stringify(contexto), phone]
  );
}

export async function logMensaje(phone, direccion, tipo, contenido) {
  try {
    await getPool().query(
      'INSERT INTO whatsapp_mensajes (phone, direccion, tipo, contenido, created_at) VALUES (?, ?, ?, ?, NOW())',
      [phone, direccion, tipo, contenido]
    );
  } catch (err) {
    console.error('[store] logMensaje error:', err.message);
  }
}

export async function listConversaciones({ query = '', estado = '', page = 1, pageSize = 15 } = {}) {
  const db = getPool();
  const offset = (page - 1) * pageSize;
  const conditions = [];
  const params = [];

  if (query) {
    conditions.push('(phone LIKE ? OR nombre LIKE ?)');
    params.push(`%${query}%`, `%${query}%`);
  }
  if (estado) {
    conditions.push('estado = ?');
    params.push(estado);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const [countRows] = await db.query(
    `SELECT COUNT(*) AS total FROM whatsapp_conversaciones ${where}`, params
  );
  const total = countRows[0].total;

  const [rows] = await db.query(
    `SELECT * FROM whatsapp_conversaciones ${where}
     ORDER BY CASE WHEN estado = 'soporte' THEN 0 ELSE 1 END, updated_at DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return { data: rows, total, page, pageSize };
}

export async function getMensajes(phone) {
  const [rows] = await getPool().query(
    'SELECT id, direccion, tipo, contenido, created_at FROM whatsapp_mensajes WHERE phone = ? ORDER BY created_at ASC',
    [phone]
  );
  return rows;
}

export async function marcarAtendido(phone) {
  await getPool().query(
    "UPDATE whatsapp_conversaciones SET estado = 'menu', updated_at = NOW() WHERE phone = ?",
    [phone]
  );
}

export async function getAllPhones() {
  const [rows] = await getPool().query('SELECT phone FROM whatsapp_conversaciones');
  return rows.map(r => r.phone);
}

export async function getCitasDisponibles(limit = 10) {
  const [rows] = await getPool().query(
    `SELECT c.id, c.nombre, c.descripcion, c.direccion, c.puntos, c.portada_url,
            cat.nombre AS categoria
     FROM citas c
     LEFT JOIN categorias cat ON c.categoria_id = cat.id
     WHERE c.activo = 1
     ORDER BY RAND()
     LIMIT ?`,
    [limit]
  );
  return rows;
}

export async function getCategorias() {
  const [rows] = await getPool().query(
    `SELECT cat.id, cat.nombre, COUNT(c.id) AS total
     FROM categorias cat
     LEFT JOIN citas c ON c.categoria_id = cat.id AND c.activo = 1
     GROUP BY cat.id, cat.nombre
     ORDER BY cat.nombre`
  );
  return rows;
}

export async function getCitasPorCategoria(categoriaId, limit = 8) {
  const [rows] = await getPool().query(
    `SELECT c.id, c.nombre, c.descripcion, c.direccion, c.puntos
     FROM citas c
     WHERE c.categoria_id = ? AND c.activo = 1
     ORDER BY RAND()
     LIMIT ?`,
    [categoriaId, limit]
  );
  return rows;
}

export async function getCitaDetalle(citaId) {
  const [rows] = await getPool().query(
    `SELECT c.id, c.nombre, c.descripcion, c.direccion, c.latitud, c.longitud, c.puntos, c.portada_url,
            cat.nombre AS categoria, n.nombre AS negocio, n.telefono AS negocio_telefono
     FROM citas c
     LEFT JOIN categorias cat ON c.categoria_id = cat.id
     LEFT JOIN negocios n ON c.negocio_id = n.id
     WHERE c.id = ?`,
    [citaId]
  );
  return rows[0] ?? null;
}

export async function getUsuarioPorPhone(phone) {
  const cleanPhone = phone.split('@')[0].replace(/\D/g, '');
  const [rows] = await getPool().query(
    `SELECT u.id, u.nombre, u.email
     FROM usuarios u
     WHERE u.email LIKE ? OR u.nombre LIKE ?
     LIMIT 1`,
    [`%${cleanPhone}%`, `%${cleanPhone}%`]
  );
  return rows[0] ?? null;
}
