// FIX: Add a triple-slash directive to include Vite's client types, resolving the error
// "Property 'env' does not exist on type 'ImportMeta'" by providing type definitions for import.meta.env.
/// <reference types="vite/client" />

import { GoogleGenAI } from "@google/genai";
import { BusinessProfile } from '../types/index.ts';

// PROFESIONALIZADO: Lê a chave da API a partir das variáveis de ambiente.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

/**
 * Checks if the Gemini API key has been configured by the user.
 * @returns {boolean} True if the key is configured, false otherwise.
 */
export const isGeminiConfigured = (): boolean => {
    return !!GEMINI_API_KEY && !GEMINI_API_KEY.startsWith("SUA_CHAVE");
};

// Initialize with a check for the API key to avoid creating an instance that will fail.
const ai = isGeminiConfigured() ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;


/**
 * Cleans a Google Business Profile URL.
 * It returns short `maps.app.goo.gl` links as is.
 * For long `google.com/maps` links, it removes query parameters to shorten them.
 * @param url - The original GBP URL.
 * @returns A cleaner, potencialmente shorter URL.
 */
const getCleanGbpLink = (url: string): string => {
    if (!url) return '';
    try {
        const urlObject = new URL(url);
        if (urlObject.hostname === 'maps.app.goo.gl') {
            return url;
        }
        if (urlObject.hostname.includes('google.com')) {
            return `${urlObject.origin}${urlObject.pathname}`;
        }
    } catch (error) {
        return url;
    }
    return url;
};


/**
 * Generates post text using Gemini API.
 * @param keywords - Keywords to base the post on.
 * @param profile - Business profile information.
 * @returns A promise that resolves to the generated post text.
 * @throws An error if the API call fails.
 */
export const generatePostText = async (keywords: string, profile: BusinessProfile): Promise<string> => {
    if (!ai) {
        throw new Error("A chave da API do Google GenAI não está configurada. Verifique suas variáveis de ambiente.");
    }

    let whatsappLink = '';
    if (profile.whatsappNumber) {
        const number = profile.whatsappNumber.replace(/\D/g, '');
        if (number) {
            whatsappLink = `https://wa.me/${number}`;
        }
    }
    
    const ctaInstruction = whatsappLink 
        ? `Após o corpo principal do post, adicione uma linha em branco. Em seguida, adicione a frase "Entre em contato pelo WhatsApp.". Na linha seguinte, adicione o link: ${whatsappLink}.`
        : 'Inclua uma chamada para ação (call to action) clara e genérica no final do corpo do texto, como "Saiba mais" ou "Visite-nos".';

    const cleanGbpLink = getCleanGbpLink(profile.gbpLink);
    const gbpLinkInstruction = cleanGbpLink
        ? `Após o link do WhatsApp (se houver), adicione outra linha em branco. Em seguida, adicione a frase "Ir Agora:", seguida do link: ${cleanGbpLink}.`
        : '';
    
    const hashtagInstruction = 'No final de todo o post, após uma linha em branco, adicione entre 3 a 5 hashtags relevantes, separadas por espaços. Exemplo: #Padaria #PaesArtesanais #CafeDaManha';

    let exampleOutput = `Que tal um clássico delicioso para o seu almoço ou jantar?

Na Padaria Bolonha, preparamos um autêntico macarrão a bolonhesa, com um molho rico e carne moída de primeira. É a combinação perfeita de sabor e conforto que você merece.`;

    if (profile.whatsappNumber) {
        exampleOutput += `

Entre em contato pelo WhatsApp.
https://wa.me/5511999998888`;
    }

    if (cleanGbpLink) {
        exampleOutput += `

Ir Agora: https://maps.app.goo.gl/XYZ123`;
    }
    
    exampleOutput += `

#PadariaBolonha #MacarraoBolonhesa #ComidaItaliana #Almoco`;

    const prompt = `
      Crie um post para o Google Business Profile para a empresa "${profile.name}".
      O post deve ser focado nas seguintes palavras-chave: "${keywords}".
      
      Instruções de Estrutura:
      1.  **Manchete:** Crie uma manchete curta e atrativa (uma frase ou pergunta).
      2.  **Linha em Branco:** Insira uma linha em branco após a manchete.
      3.  **Corpo do Texto:** Desenvolva o restante do post, detalhando a oferta ou notícia.
      4.  **CTAs e Hashtags:** Devem vir no final, após o corpo do texto, seguindo as regras abaixo.

      Instruções Gerais:
      - O tom deve ser profissional, mas amigável e convidativo.
      - O post deve ser conciso e direto, com no máximo 1500 caracteres.
      - ${ctaInstruction}
      - ${gbpLinkInstruction}
      - ${hashtagInstruction}
      - Retorne apenas o texto do post, sem nenhuma formatação extra, introduções ou observações.

      Exemplo de output:
      ${exampleOutput}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const text = response.text;
        
        if (!text) {
          throw new Error('A API da IA não retornou texto.');
        }
        return text.trim();

    } catch (error) {
        console.error("Error generating post text with Gemini API:", error);
        throw new Error("Ocorreu um erro ao gerar o texto com a IA. Por favor, verifique sua chave de API e tente novamente.");
    }
};

/**
 * Generates a search query for Unsplash based on the post text.
 * @param postText - The text of the post.
 * @returns A promise that resolves to a concise search query.
 */
export const generateImageSearchQuery = async (postText: string): Promise<string> => {
    if (!ai) throw new Error("A chave da API do Google GenAI não está configurada.");
  
    const prompt = `Baseado no seguinte texto de post, crie um termo de busca curto e eficaz (2-4 palavras) em português para encontrar uma imagem de estoque relevante no Unsplash. Retorne apenas o termo de busca. Texto do Post: "${postText}"`;
  
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        if (!response.text) throw new Error('A API da IA não gerou uma consulta de imagem.');
        return response.text.trim();
    } catch (error) {
        console.error("Error generating image query with Gemini API:", error);
        throw new Error("Erro ao gerar sugestão de imagem.");
    }
};

/**
 * Generates a short, catchy phrase for an image overlay.
 * @param postText - The main text of the post.
 * @returns A promise that resolves to a short text suggestion.
 */
export const generateImageTextSuggestion = async (postText: string): Promise<string> => {
    if (!ai) throw new Error("IA não configurada.");

    const prompt = `Baseado no seguinte texto de post, crie uma frase curta e de impacto (máximo 5 palavras) para ser sobreposta em uma imagem. Retorne apenas a frase. Texto do Post: "${postText}"`;

    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        if (!response.text) throw new Error('A API da IA não gerou texto para a imagem.');
        return response.text.trim();
    } catch (error) {
        console.error("Error generating image text suggestion with Gemini API:", error);
        throw new Error("Erro ao gerar texto para a imagem.");
    }
};

/**
 * Generates a response to a customer review.
 * @param reviewText - The text of the customer's review.
 * @param rating - The star rating given by the customer (1-5).
 * @param profile - The business profile.
 * @returns A promise that resolves to a suggested response.
 */
export const generateReviewResponse = async (reviewText: string, rating: number, profile: BusinessProfile): Promise<string> => {
    if (!ai) throw new Error("A chave da API do Google GenAI não está configurada.");

    let toneInstruction = '';
    if (rating >= 4) {
        toneInstruction = "O tom deve ser caloroso e grato.";
    } else if (rating === 3) {
        toneInstruction = "O tom deve ser equilibrado e profissional. Agradeça pelo feedback e mostre compromisso em melhorar.";
    } else {
        toneInstruction = "O tom deve ser sério, empático e muito profissional. Peça desculpas pela experiência e ofereça uma maneira de resolver o problema offline.";
    }

    const prompt = `Você é gerente da empresa "${profile.name}". Responda a uma avaliação de cliente (Nota ${rating}/5): "${reviewText}". Instruções: ${toneInstruction} Agradeça sempre. Personalize a resposta. Retorne apenas o texto da resposta.`;

    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        if (!response.text) throw new Error('A API da IA não gerou uma resposta.');
        return response.text.trim();
    } catch (error) {
        console.error("Error generating review response with Gemini API:", error);
        throw new Error("Ocorreu um erro ao gerar a resposta com a IA.");
    }
};

/**
 * Generates an answer for a Q&A section.
 * @param question - The customer's question.
 * @param profile - The business profile.
 * @returns A promise that resolves to a suggested answer.
 */
export const generateQnaResponse = async (question: string, profile: BusinessProfile): Promise<string> => {
    if (!ai) throw new Error("A chave da API do Google GenAI não está configurada.");

    const prompt = `Você é o gerente da empresa "${profile.name}". Responda a pergunta de um cliente de forma clara, útil e amigável. Pergunta: "${question}". Instruções: Responda diretamente, seja conciso e profissional. Retorne apenas o texto da resposta.`;

    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        if (!response.text) throw new Error('A API da IA não gerou uma resposta.');
        return response.text.trim();
    } catch (error) {
        console.error("Error generating Q&A response with Gemini API:", error);
        throw new Error("Ocorreu um erro ao gerar a resposta com a IA.");
    }
};

/**
 * Generates a description for a product or service.
 * @param productName - The name of the product or service.
 * @param keywords - Keywords or features of the product.
 * @param profile - The business profile.
 * @returns A promise that resolves to a suggested description.
 */
export const generateProductDescription = async (productName: string, keywords: string, profile: BusinessProfile): Promise<string> => {
    if (!ai) throw new Error("A chave da API do Google GenAI não está configurada.");

    const prompt = `Você é redator da empresa "${profile.name}". Crie uma descrição curta e persuasiva para o produto/serviço "${productName}" com as características: "${keywords}". Instruções: 2-3 frases, focando nos benefícios para o cliente. Retorne apenas o texto da descrição.`;

    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        if (!response.text) throw new Error('A API da IA não gerou uma descrição.');
        return response.text.trim();
    } catch (error) {
        console.error("Error generating product description with Gemini API:", error);
        throw new Error("Ocorreu um erro ao gerar a descrição com a IA.");
    }
};