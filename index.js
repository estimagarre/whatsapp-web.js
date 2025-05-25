// index.js
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { default: pino } = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const path = require('path');

// Archivo donde se guarda la sesión
const authFile = './auth_info.json';
const { state, saveState } = useSingleFileAuthState(authFile);

async function connectBot() {
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
  });

  // Evento de mensajes entrantes
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const messageContent = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

    if (messageContent) {
      console.log(`Mensaje de ${sender}: ${messageContent}`);

      if (messageContent.toLowerCase() === 'hola') {
        await sock.sendMessage(sender, { text: 'Hola, soy tu bot 🧠✉️' });
      }
    }
  });

  // Evento de conexión
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Conexión cerrada. Reconectando:', shouldReconnect);
      if (shouldReconnect) connectBot();
    } else if (connection === 'open') {
      console.log('Conectado exitosamente a WhatsApp 🚀');
    }
  });

  // Guardar sesión cuando cambie
  sock.ev.on('creds.update', saveState);
}

connectBot();
