// index.js

// 1. Modo estricto para evitar errores comunes
'use strict';

// 2. Importamos el cliente de OpenAI
const { OpenAI } = require("openai");
const dotenv = require("dotenv");
dotenv.config(); // Carga las variables del archivo .env si existe

// 3. Leer la clave desde la variable de entorno
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 4. Crear una función para consultar a la IA
async function responderConIA(pregunta) {
  try {
    const respuesta = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: pregunta }],
    });
    console.log("Respuesta de la IA:", respuesta.choices[0].message.content);
    return respuesta.choices[0].message.content;
  } catch (error) {
    console.error("Error al llamar a OpenAI:", error);
    return "Ocurrió un error al intentar responder con IA.";
  }
}

// 5. Prueba directa
responderConIA("Hola, ¿qué puedes hacer por mí?");

