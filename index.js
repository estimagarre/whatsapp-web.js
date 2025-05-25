const express = require('express');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.CLAVE_API_DE_OPENAI,
});

app.post('/preguntar', async (req, res) => {
  try {
    const pregunta = req.body.mensaje || 'Hola, ¿quién eres?';

    const respuesta = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: pregunta }],
    });

    const contenido = respuesta.choices[0].message.content;
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
