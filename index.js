// index.js
const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

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
    console.error('Error al contactar a OpenAI:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor funcionando en el puerto ${PORT}`);
});
