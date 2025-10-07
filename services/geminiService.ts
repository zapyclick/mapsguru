// src/services/geminiService.ts
import { BusinessProfile } from '../types/index.ts';

// A função de verificação agora é simples. Se as funções do backend existirem, está tudo ok.
// Em um app real, poderíamos ter um endpoint de healthcheck, mas por agora, isso basta.
export const isGeminiConfigured = (): boolean => {
    return true; // Se o deploy foi bem-sucedido, assumimos que está configurado.
};

/**
 * Gera o texto do post chamando nossa Netlify Function segura.
 * @param prompt - O prompt completo para a IA.
 * @returns Uma promise com o texto gerado.
 */
export const generatePostText = async (prompt: string): Promise<string> => {
    try {
        // Chama nossa função no backend. O Netlify a reconhece pelo caminho /.netlify/functions/
        const response = await fetch(`/.netlify/functions/generate-copy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Enviamos o prompt no corpo da requisição. A chave NÃO VEM AQUI.
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro desconhecido na API');
        }

        const data = await response.json();
        return data.generatedText;

    } catch (error) {
        console.error("Erro ao chamar a função de geração de texto:", error);
        throw new Error("Não foi possível se conectar ao serviço de IA. Tente novamente.");
    }
};

/**
 * Gera uma sugestão de busca de imagem usando a mesma função do Gemini.
 * @param postText - O texto do post para basear a busca.
 * @returns Uma promise com o termo de busca.
 */
export const generateImageSearchQuery = async (postText: string): Promise<string> => {
    const prompt = `Baseado no seguinte texto de post, crie um termo de busca curto e eficaz (2-4 palavras) em português para encontrar uma imagem de estoque relevante no Unsplash. Retorne apenas o termo de busca. Texto do Post: "${postText}"`;
    return generatePostText(prompt);
};

// As outras funções (generateImageTextSuggestion, etc.) podem ser reescritas
// para usar a mesma lógica de chamar `generatePostText` com prompts diferentes.
// Por enquanto, vamos focar no principal.