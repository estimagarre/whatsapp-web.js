// index.js
const express = require('express');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Este nombre debe coincidir con tu variable
  })
);

app.post('/preguntar', async (req, res) => {
  try {
    const pregunta = req.body.mensaje || 'Hola, ¿quién eres?';

    const respuesta = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: pregunta }],
    });

    const contenido = respuesta.data.choices[0].message.content;
    res.json({ respuesta: contenido });
  } catch (error) {
    console.error('Error al contactar a OpenAI:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor en línea en el puerto ${PORT}`);
});
