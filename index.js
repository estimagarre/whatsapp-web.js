const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const Boom = require('@hapi/boom');
const fs = require('fs');
require('dotenv').config();

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function iniciarBot() {
  const sock = makeWASocket({
    logger: { level: 'silent' },
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason === 401) {
        console.log('❌ Sesión cerrada. Escanea el QR de nuevo.');
        fs.unlinkSync('./auth_info.json');
        iniciarBot();
      } else {
        console.log('♻️ Reconectando...', reason);
        iniciarBot();
      }
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado correctamente a WhatsApp.');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
    const remitente = msg.key.remoteJid;

    if (texto.toLowerCase().includes('hola')) {
      await sock.sendMessage(remitente, { text: 'Hola, soy tu bot 🤖. ¿En qué puedo ayudarte?' });
    }
  });

  sock.ev.on('creds.update', saveState);
}

iniciarBot();
