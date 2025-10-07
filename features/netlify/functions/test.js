// netlify/functions/test.js
export const handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Olá! O backend está funcionando!' }),
  };
};