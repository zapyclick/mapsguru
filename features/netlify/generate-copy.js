// netlify/functions/generate-copy.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializa a API com sua chave segura do cofre do Netlify
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async (event) => {
  // Pega o prompt que o frontend enviou
  const { prompt } = JSON.parse(event.body);

  if (!prompt) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'O prompt é obrigatório.' }),
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ generatedText: text }),
    };
  } catch (error) {
    console.error("Erro na API do Gemini:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha ao gerar texto com a IA.' }),
    };
  }
};