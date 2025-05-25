// index.js para WhatsApp Web usando Baileys y QR en Railway (versión estable 24/7)

const { makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const pino = require('pino');
require('dotenv').config();

// Autenticación guardada en archivo
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function iniciarBot() {
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true, // Mostrar QR directamente en consola
    auth: state,
  });

  // Guardar sesión al conectarse
  sock.ev.on('creds.update', saveState);

  // Manejar reconexiones
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const motivo = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (motivo === DisconnectReason.loggedOut) {
        console.log('Sesíon cerrada. Vuelve a escanear el código QR.');
        iniciarBot();
      } else {
        console.log('Reconectando...');
        iniciarBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Conectado a WhatsApp Web. Bot funcionando 24/7.');
    }
  });

  // Manejo de mensajes
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || m.key.fromMe) return;

    const mensajeTexto = m.message?.conversation || m.message?.extendedTextMessage?.text;

    if (mensajeTexto?.toLowerCase().includes('hola')) {
      await sock.sendMessage(m.key.remoteJid, {
        text: 'Hola 👋 soy el bot Esti Natural Cura. ¡Estoy activo las 24 horas!'
      });
    }
  });
}

iniciarBot();
