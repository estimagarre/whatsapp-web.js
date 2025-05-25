const { default: makeWASocket, useSingleFileAuthState, makeInMemoryStore } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const P = require('pino')
const fs = require('fs')
const path = require('path')

const { state, saveState } = useSingleFileAuthState('./auth_info.json')
const store = makeInMemoryStore({ logger: P().child({ level: 'debug', stream: 'store' }) })

async function iniciarBot() {
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' })
  })

  store.bind(sock.ev)

  sock.ev.on('creds.update', saveState)

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const msg = messages[0]

    if (!msg.message) return

    const texto = msg.message.conversation || msg.message.extendedTextMessage?.text

    if (texto === 'hola') {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Hola, soy tu bot conectado con QR 😎' })
    }
  })
}

iniciarBot()

