// netlify/functions/get-unsplash-images.js
const fetch = require('node-fetch');

exports.handler = async (event) => {
  const query = event.queryStringParameters.query;

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Parâmetro "query" é obrigatório.' }),
    };
  }

  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&per_page=6&orientation=landscape`, {
      headers: {
        // A mágica acontece aqui! A chave vem do cofre do Netlify.
        'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
      }
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data.results),
    };
  } catch (error) {
    console.error("Erro na API do Unsplash:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Falha ao buscar imagens.' }),
    };
  }
};