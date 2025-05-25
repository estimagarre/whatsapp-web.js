const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const Boom = require('@hapi/boom');
const Pino = require('pino');
const fs = require('fs');
require('dotenv').config();

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

  const sock = makeWASocket({
    logger: Pino({ level: 'silent' }), // Usa correctamente Pino
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const reason = Boom.boomify(lastDisconnect?.error)?.output?.statusCode;

      if (reason === 401) {
        console.log('❌ Sesión cerrada. Escanea el QR de nuevo.');
        fs.rmSync('./auth_info_baileys', { recursive: true, force: true });
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

  sock.ev.on('creds.update', saveCreds);
}

iniciarBot();
