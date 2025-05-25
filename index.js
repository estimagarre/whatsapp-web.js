const makeWASocket = require('@whiskeysockets/baileys').default
const { makeInMemoryStore } = require('@whiskeysockets/baileys')
const { useMultiFileAuthState } = require('@whiskeysockets/baileys')
const P = require('pino')

async function iniciarBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' }),
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    const m = messages[0]
    if (!m.message) return

    const texto = m.message.conversation || m.message.extendedTextMessage?.text

    if (texto?.toLowerCase() === 'hola') {
      await sock.sendMessage(m.key.remoteJid, { text: '¡Hola! Soy tu bot Baileys QR conectado 24/7 🚀' })
    }
  })
}

iniciarBot()
