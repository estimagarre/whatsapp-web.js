const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');

// Cargar configuración
require('dotenv').config();

// Estado de autenticación
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

// Crear conexión
async function conectar() {
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('creds.update', saveState);
  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      console.log('Conexión cerrada. Reconectando...', shouldReconnect);
      if (shouldReconnect) {
        conectar();
      }
    } else if (connection === 'open') {
      console.log('✅ ¡Conectado correctamente a WhatsApp!');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;
    const remitente = msg.key.remoteJid;

    if (texto && texto.toLowerCase().includes('hola')) {
      await sock.sendMessage(remitente, { text: 'Hola, soy tu bot IA 🤖 ¿En qué te puedo ayudar?' });
    }
  });
}

conectar();
