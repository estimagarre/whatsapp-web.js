const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');

// ✅ Aquí está el FIX: usar correctamente `state` y `saveState`
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

// Crear el socket de WhatsApp
const sock = makeWASocket({
  logger: P({ level: 'silent' }),
  printQRInTerminal: true,
  auth: state,
});

// Escuchar eventos de conexión
sock.ev.on('connection.update', (update) => {
  const { connection, lastDisconnect } = update;
  if (connection === 'close') {
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
    if (reason === 401) {
      console.log('❌ Sesión cerrada. Elimina auth_info.json y vuelve a escanear el QR.');
    } else {
      console.log('🔁 Reconectando...');
    }
  } else if (connection === 'open') {
    console.log('✅ Conectado exitosamente a WhatsApp 🚀');
  }
});

// Escuchar y guardar la sesión
sock.ev.on('creds.update', saveState);
