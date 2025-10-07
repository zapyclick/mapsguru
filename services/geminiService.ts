// src/services/geminiService.ts
import { BusinessProfile } from '../types/index.ts';

// A função de verificação agora é simples. Se o deploy foi bem-sucedido, assumimos que está configurado.
export const isGeminiConfigured = (): boolean => {
    return true;
};

/**
 * Função genérica para chamar nossa Netlify Function segura.
 * Todas as outras funções usarão esta para evitar repetição de código.
 * @param prompt - O prompt completo para a IA.
 * @returns Uma promise com o texto gerado.
 */
const callGeminiAPI = async (prompt: string): Promise<string> => {
    try {
        const response = await fetch(`/.netlify/functions/generate-copy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
 * Generates post text using Gemini API.
 */
export const generatePostText = async (keywords: string, tone: string, profile: BusinessProfile): Promise<string> => {
    const toneInstructionMap: Record<string, string> = {
        'Amigável': 'O tom deve ser amigável e convidativo.',
        'Profissional': 'O tom deve ser profissional e formal.',
        'Divertido': 'O tom deve ser divertido e descontraído.',
        'Promocional': 'O tom deve ser promocional e direto.'
    };
    const toneInstruction = toneInstructionMap[tone] || 'O tom deve ser profissional, mas amigável.';
    const prompt = `Crie um post para o Google Business Profile para a empresa "${profile.name}" com base nas palavras-chave: "${keywords}". Instruções: ${toneInstruction}. O post deve ser conciso, com no máximo 1500 caracteres. Retorne apenas o texto do post.`;
    return callGeminiAPI(prompt);
};

/**
 * Generates a search query for Unsplash based on the post text.
 */
export const generateImageSearchQuery = async (postText: string): Promise<string> => {
    const prompt = `Baseado no texto: "${postText}", crie um termo de busca curto (2-4 palavras) para o Unsplash. Retorne apenas o termo.`;
    return callGeminiAPI(prompt);
};

/**
 * Generates a short, catchy phrase for an image overlay.
 * A FUNÇÃO QUE ESTAVA FALTANDO!
 */
export const generateImageTextSuggestion = async (postText: string): Promise<string> => {
    const prompt = `Baseado no texto: "${postText}", crie uma frase curta e de impacto (máximo 5 palavras) para sobrepor em uma imagem. Retorne apenas a frase.`;
    return callGeminiAPI(prompt);
};

/**
 * As outras funções também estão aqui, caso seu app precise delas.
 */
export const generateReviewResponse = async (reviewText: string, rating: number, profile: BusinessProfile): Promise<string> => {
    let toneInstruction = rating >= 4 ? " caloroso e grato." : rating === 3 ? " equilibrado e profissional." : " sério, empático e profissional.";
    const prompt = `Como gerente da "${profile.name}", responda à avaliação (Nota ${rating}/5): "${reviewText}". Instruções: Tom${toneInstruction} Agradeça. Retorne apenas a resposta.`;
    return callGeminiAPI(prompt);
};

export const generateQnaResponse = async (question: string, profile: BusinessProfile): Promise<string> => {
    const prompt = `Como gerente da "${profile.name}", responda à pergunta: "${question}". Instruções: Resposta clara, útil e amigável. Retorne apenas a resposta.`;
    return callGeminiAPI(prompt);
};

export const generateProductDescription = async (productName: string, keywords: string, profile: BusinessProfile): Promise<string> => {
    const prompt = `Como redator da "${profile.name}", crie uma descrição curta para o produto/serviço "${productName}" com as características: "${keywords}". Instruções: 2-3 frases, foco nos benefícios. Retorne apenas a descrição.`;
    return callGeminiAPI(prompt);
};