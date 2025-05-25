const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const Boom = require('@hapi/boom');
const fs = require('fs');
require('dotenv').config();

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
                console.log('🛑 Sesión cerrada, escanea el QR otra vez.');
                fs.unlinkSync('./auth_info.json');
                iniciarBot();
            } else {
                console.log('🔁 Reintentando...', reason);
                iniciarBot();
            }
        } else if (connection === 'open') {
            console.log('✅ Bot conectado exitosamente a WhatsApp.');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type === 'notify' && messages[0]?.message) {
            const m = messages[0];
            const text = m.message.conversation || m.message.extendedTextMessage?.text;
            const remote = m.key.remoteJid;

            if (text?.toLowerCase().includes('hola')) {
                await sock.sendMessage(remote, {
                    text: '¡Hola! Soy tu bot 🤖. ¿En qué puedo ayudarte?'
                });
            }
        }
    });

    sock.ev.on('creds.update', saveState);
}

iniciarBot();

