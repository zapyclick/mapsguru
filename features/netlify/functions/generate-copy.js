import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const handler = async (event) => {
  const { prompt } = JSON.parse(event.body);

  if (!prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: 'O prompt é obrigatório.' }) };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { statusCode: 200, body: JSON.stringify({ generatedText: text }) };
  } catch (error) {
    console.error("Erro na API do Gemini:", error);
    return { statusCode: 500, body: JSON.stringify({ error: 'Falha ao gerar texto com a IA.' }) };
  }
};