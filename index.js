const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.CLAVE_API_DE_OPENAI,
});

const openai = new OpenAIApi(configuration);

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

app.listen(3000, () => {
  console.log('Servidor activo en el puerto 3000');
});
