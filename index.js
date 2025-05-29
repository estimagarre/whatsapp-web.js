require('dotenv').config();
global.crypto = require('crypto'); // ✅ Requerido para entorno Railway

const { obtenerRespuestaIA } = require('./openai');
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path'); // 👈 Agregado para asegurar ruta absoluta

const historialConversaciones = {}; // Historial por número

async function iniciarBot() {
  console.log("📦 Verificando archivos de sesión...");

  const sessionPath = path.join(__dirname, 'auth_info_baileys');
  const credsFile = path.join(sessionPath, 'creds.json');

  if (fs.existsSync(sessionPath) && fs.existsSync(credsFile)) {
    console.log("📂 auth_info_baileys existe: true");
    console.log("📄 creds.json existe: true");
  } else {
    console.log("⚠️ Archivos de sesión no encontrados. Se generará uno nuevo al escanear el QR.");
  }

  console.log("🤖 Bot iniciado");

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath); // 👈 Ruta corregida
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true, // 👈 Activa QR temporalmente para Railway
  });

  sock.ev.on('connection.update', (update) => {
    console.log("🔄 Estado conexión:", update);

    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log("🔐 Escanea este código QR para conectar:");
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const motivo = new Boom(lastDisconnect?.error)?.output?.statusCode;
      console.log("⚠️ Conexión cerrada. Código:", motivo);
      if (motivo !== 401) {
        iniciarBot(); // Reintenta conexión
      }
    }

    if (connection === 'open') {
      console.log("✅ Esti Franco conectado a WhatsApp.");
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const mensaje = messages[0];
    if (!mensaje.message || mensaje.key.fromMe) return;

    const numero = mensaje.key.remoteJid;
    const texto = mensaje.message.conversation || mensaje.message.extendedTextMessage?.text;
    if (!texto) return;

    // Crear historial por número si no existe
    if (!historialConversaciones[numero]) {
      historialConversaciones[numero] = [];
    }

    // Agregar el mensaje del usuario al historial
    historialConversaciones[numero].push({ role: "user", content: texto });

    // Obtener respuesta de la IA con historial incluido
    const respuesta = await obtenerRespuestaIA(historialConversaciones[numero]);

    // Agregar respuesta de la IA al historial
    historialConversaciones[numero].push({ role: "assistant", content: respuesta });

    // Enviar respuesta
    await sock.sendMessage(numero, { text: respuesta });
  });

  sock.ev.on('creds.update', saveCreds);
}

// 🛠️ Captura errores reales aquí
iniciarBot().catch((error) => {
  console.error("❌ Error real al iniciar el bot:", error);
});

// Mantener Railway activo con un servidor HTTP
const http = require('http');
http.createServer((req, res) => {
  res.write("Esti Franco está en línea ✅");
  res.end();
}).listen(process.env.PORT || 3050);

