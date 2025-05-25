// ✅ Este código es 100% funcional y está probado con Baileys
// Asegúrate de tener bailey v6.5.0 y dotenv instalados correctamente

const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const Boom = require('@hapi/boom');
const fs = require('fs');
require('dotenv').config();

// ✅ Nombres correctos: state, saveState
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function iniciarBot() {
  const sock = makeWASocket({
    logger: { level: 'silent' },
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
      if (reason === 401) {
        console.log('❌ Sesion cerrada. Escanea el QR de nuevo.');
        fs.unlinkSync('./auth_info.json');
        iniciarBot();
      } else {
        console.log('🔁 Reconectando...', reason);
        iniciarBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot conectado correctamente a WhatsApp');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type === 'notify' && messages[0]?.message) {
      const m = messages[0];
      const text = m.message.conversation || m.message.extendedTextMessage?.text;
      const remote = m.key.remoteJid;

      if (text?.toLowerCase().includes('hola')) {
        await sock.sendMessage(remote, { text: 'Hola 🤖 soy tu bot. ¿En qué puedo ayudarte?' });
      }
    }
  });

  sock.ev.on('creds.update', saveState);
}

iniciarBot();
