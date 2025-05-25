// index.js

'use strict';

// 1. Cargar Express y dotenv
const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');
require('dotenv').config();

// 2. Configurar Express
const app = express();
app.use(bodyParser.json());

// 3. Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 4. Ruta principal para recibir preguntas
app.post('/preguntar', async (req, res) => {
  try {
    const pregunta = req.body.mensaje || 'Hola, ¿quién eres?';

    const respuesta = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: pregunta }]
    });

    const contenido = respuesta.choices[0].message.content;
    res.json({ respuesta: contenido });

  } catch (error) {
    console.error('Error al contactar con OpenAI:', error.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// 5. Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
