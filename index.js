const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const P = require('pino')

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth') // Asegúrate de tener la carpeta 'auth'

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' }),
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message) return

    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text

    if (texto?.toLowerCase() === 'hola') {
      await sock.sendMessage(msg.key.remoteJid, { text: '¡Hola! Soy tu bot WhatsApp QR 24/7 🚀' })
    }
  })
}

iniciarBot()
