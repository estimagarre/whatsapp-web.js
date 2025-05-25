const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');

// Estado de sesión
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

// Crear socket
const sock = makeWASocket({
  logger: P({ level: 'silent' }),
  printQRInTerminal: true,
  auth: state,
});

// Escuchar eventos
sock.ev.on('connection.update', (update) => {
  const { connection, lastDisconnect } = update;
  if (connection === 'close') {
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
    if (reason === 401) {
      console.log('❌ Sesión cerrada. Elimina auth_info.json y vuelve a generar QR.');
    } else {
      console.log('🔁 Reconectando...');
    }
  } else if (connection === 'open') {
    console.log('✅ ¡Conexión con WhatsApp exitosa!');
  }
});

// Guardar cambios de sesión
sock.ev.on('creds.update', saveState);
