import { GoogleGenAI } from "@google/genai";
import { BusinessProfile } from '../types/index.ts';

// The API key must be obtained exclusively from the environment variable `process.env.API_KEY`.
// This is a hard requirement.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.error("A variável de ambiente API_KEY do Google GenAI não está definida.");
}

// Initialize with a check for the API key to avoid creating an instance that will fail.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

/**
 * Cleans a Google Business Profile URL.
 * It returns short `maps.app.goo.gl` links as is.
 * For long `google.com/maps` links, it removes query parameters to shorten them.
 * @param url - The original GBP URL.
 * @returns A cleaner, potentially shorter URL.
 */
const getCleanGbpLink = (url: string): string => {
    if (!url) return '';
    try {
        const urlObject = new URL(url);
        // If it's already a short link, return it as is.
        if (urlObject.hostname === 'maps.app.goo.gl') {
            return url;
        }
        // If it's a long google.com/maps link, strip the query parameters.
        if (urlObject.hostname.includes('google.com')) {
            return `${urlObject.origin}${urlObject.pathname}`;
        }
    } catch (error) {
        // If the URL is invalid, return it as is for the user to see the error.
        return url;
    }
    // For any other case, return the original URL.
    return url;
};


/**
 * Generates post text using Gemini API.
 * @param keywords - Keywords to base the post on.
 * @param profile - Business profile information.
 * @returns A promise that resolves to the generated post text.
 */
export const generatePostText = async (keywords: string, profile: BusinessProfile): Promise<string> => {
    if (!ai) {
        return "Erro: A chave da API do Google GenAI não está configurada. Verifique suas variáveis de ambiente.";
    }

    // Create the full WhatsApp link if a number is provided
    let whatsappLink = '';
    if (profile.whatsappNumber) {
        const number = profile.whatsappNumber.replace(/\D/g, '');
        if (number) {
            whatsappLink = `https://wa.me/${number}`;
        }
    }
    
    // Dynamically create the CTA instruction based on whether a WhatsApp link exists
    const ctaInstruction = whatsappLink 
        ? `Após o corpo principal do post, adicione uma linha em branco. Em seguida, adicione a frase "Entre em contato pelo WhatsApp.". Na linha seguinte, adicione o link: ${whatsappLink}.`
        : 'Inclua uma chamada para ação (call to action) clara e genérica no final do corpo do texto, como "Saiba mais" ou "Visite-nos".';

    const cleanGbpLink = getCleanGbpLink(profile.gbpLink);
    const gbpLinkInstruction = cleanGbpLink
        ? `Após o link do WhatsApp (se houver), adicione outra linha em branco. Em seguida, adicione a frase "Ir Agora:", seguida do link: ${cleanGbpLink}.`
        : '';
    
    const hashtagInstruction = 'No final de todo o post, após uma linha em branco, adicione entre 3 a 5 hashtags relevantes, separadas por espaços. Exemplo: #Padaria #PaesArtesanais #CafeDaManha';


    // Dynamically build the example output to avoid showing a fake "Ir Agora" link if the user hasn't provided one.
    let exampleOutput = `Que tal um clássico delicioso para o seu almoço ou jantar?

Na Padaria Bolonha, preparamos um autêntico macarrão a bolonhesa, com um molho rico e carne moída de primeira. É a combinação perfeita de sabor e conforto que você merece.`;

    // Add WhatsApp part to example only if a number exists in the profile
    if (profile.whatsappNumber) {
        exampleOutput += `

Entre em contato pelo WhatsApp.
https://wa.me/5511999998888`;
    }

    // Add GBP link part to example only if a link exists in the profile
    if (cleanGbpLink) {
        exampleOutput += `

Ir Agora: https://maps.app.goo.gl/XYZ123`;
    }
    
    // Add hashtags to the example
    exampleOutput += `

#PadariaBolonha #MacarraoBolonhesa #ComidaItaliana #Almoco`;

    const prompt = `
      Crie um post para o Google Business Profile para a empresa "${profile.name}".
      O post deve ser focado nas seguintes palavras-chave: "${keywords}".
      
      Instruções de Estrutura:
      1.  **Manchete:** Crie uma manchete curta e atrativa (uma frase ou pergunta).
      2.  **Linha em Branco:** Insira uma linha em branco após a manchete.
      3.  **Corpo do Texto:** Desenvolva o restante do post, detalhando a oferta ou notícia.
      4.  **CTAs:** As chamadas para ação (WhatsApp e "Ir Agora") devem vir no final, após o corpo do texto, seguindo as regras abaixo.
      5.  **Hashtags:** Adicione as hashtags no final de tudo, conforme a instrução específica.

      Instruções Gerais:
      - O tom deve ser profissional, mas amigável e convidativo.
      - O post deve ser conciso e direto.
      - O post deve ter no máximo 1500 caracteres no total.
      - ${ctaInstruction}
      - ${gbpLinkInstruction}
      - ${hashtagInstruction}
      - Retorne apenas o texto do post, sem nenhuma formatação extra, introduções ou observações.

      Exemplo de output com a nova estrutura:
      ${exampleOutput}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const text = response.text;
        
        if (!text) {
          throw new Error('No text generated by Gemini API.');
        }

        // Trim the response to remove any extraneous whitespace from the model.
        return text.trim();

    } catch (error) {
        console.error("Error generating post text with Gemini API:", error);
        return "Ocorreu um erro ao gerar o texto com a IA. Por favor, verifique sua chave de API e tente novamente.";
    }
};

/**
 * Generates a search query for Unsplash based on the post text.
 * @param postText - The text of the post.
 * @returns A promise that resolves to a concise search query.
 */
export const generateImageSearchQuery = async (postText: string): Promise<string> => {
    if (!ai) {
        return "A chave da API do Google GenAI não está configurada.";
    }
  
    const model = 'gemini-2.5-flash';

    const prompt = `
      Baseado no seguinte texto de post para o Google Business Profile, crie um termo de busca curto e eficaz (2-4 palavras) em português para encontrar uma imagem de estoque relevante.
      O termo de busca deve ser genérico o suficiente para encontrar boas imagens no Unsplash.

      Texto do Post: "${postText}"

      Exemplo de output para um post sobre consultoria financeira:
      "reunião de negócios finanças"

      Retorne apenas o termo de busca, sem nenhuma formatação extra, introduções ou observações.
    `;
  
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });
        
        const text = response.text;

        if (!text) {
            throw new Error('No image query generated by Gemini API.');
        }

        return text.trim();
    } catch (error) {
        console.error("Error generating image query with Gemini API:", error);
        return "Erro ao gerar sugestão de imagem.";
    }
};

/**
 * Generates a short, catchy phrase for an image overlay.
 * @param postText - The main text of the post.
 * @returns A promise that resolves to a short text suggestion.
 */
export const generateImageTextSuggestion = async (postText: string): Promise<string> => {
    if (!ai) {
        return "IA não configurada.";
    }

    const prompt = `
      Baseado no seguinte texto de post, crie uma frase curta e de impacto (máximo 5 palavras) para ser sobreposta em uma imagem.
      A frase deve ser um gancho visual, como uma pergunta ou uma afirmação forte.

      Texto do Post: "${postText}"

      Exemplo de output para um post sobre consultoria financeira:
      "Suas finanças, seu futuro."

      Retorne apenas a frase, sem nenhuma formatação extra, introduções ou observações.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        const text = response.text;

        if (!text) {
          throw new Error('No text generated for image by Gemini API.');
        }

        return text.trim();
    } catch (error) {
        console.error("Error generating image text suggestion with Gemini API:", error);
        return "Erro ao gerar texto.";
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
    if (!ai) {
        return "Erro: A chave da API do Google GenAI não está configurada.";
    }

    let toneInstruction = '';
    if (rating >= 4) {
        toneInstruction = "O tom deve ser caloroso e grato. Se o cliente mencionou algo específico que gostou, tente fazer referência a isso para mostrar que a avaliação foi lida com atenção.";
    } else if (rating === 3) {
        toneInstruction = "O tom deve ser equilibrado e profissional. Agradeça pelo feedback honesto e mostre que a empresa está comprometida em melhorar. Reconheça os pontos positivos e negativos se mencionados.";
    } else {
        toneInstruction = "O tom deve ser sério, empático e muito profissional. Peça desculpas pela experiência negativa. Ofereça uma maneira de resolver o problema offline (por exemplo, 'Gostaríamos muito de entender melhor o que aconteceu. Por favor, entre em contato conosco diretamente'). Não dê desculpas nem seja defensivo.";
    }

    const prompt = `
        Você é um gerente de comunidade para a empresa "${profile.name}". Sua tarefa é responder a uma avaliação de cliente de forma profissional e amigável.

        Avaliação do Cliente (Nota ${rating}/5):
        "${reviewText}"

        Instruções de Tom e Conteúdo:
        - ${toneInstruction}
        - Mantenha a resposta concisa e respeitosa.
        - Sempre agradeça ao cliente pela avaliação, independentemente da nota.
        - Personalize a resposta, evitando respostas genéricas.
        - Retorne apenas o texto da resposta, sem introduções extras como "Aqui está uma sugestão de resposta:".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        
        if (!text) {
            throw new Error('No response generated by Gemini API.');
        }

        return text.trim();

    } catch (error) {
        console.error("Error generating review response with Gemini API:", error);
        return "Ocorreu um erro ao gerar a resposta com a IA. Por favor, verifique sua chave de API e tente novamente.";
    }
};

/**
 * Generates an answer for a Q&A section.
 * @param question - The customer's question.
 * @param profile - The business profile.
 * @returns A promise that resolves to a suggested answer.
 */
export const generateQnaResponse = async (question: string, profile: BusinessProfile): Promise<string> => {
    if (!ai) {
        return "Erro: A chave da API do Google GenAI não está configurada.";
    }

    const prompt = `
        Você é o gerente da empresa "${profile.name}". Sua tarefa é criar uma resposta clara, útil e amigável para uma pergunta frequente de clientes.

        Pergunta do Cliente:
        "${question}"

        Instruções:
        - Responda diretamente à pergunta.
        - Mantenha a resposta concisa e fácil de entender.
        - O tom deve ser profissional e prestativo.
        - Se relevante, inclua uma chamada para ação sutil (Ex: "Esperamos por você!", "Venha nos visitar.").
        - Retorne apenas o texto da resposta, sem nenhuma introdução como "Aqui está a resposta:".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        
        if (!text) {
            throw new Error('No response generated by Gemini API for Q&A.');
        }

        return text.trim();

    } catch (error) {
        console.error("Error generating Q&A response with Gemini API:", error);
        return "Ocorreu um erro ao gerar a resposta com a IA. Por favor, verifique sua chave de API e tente novamente.";
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
    if (!ai) {
        return "Erro: A chave da API do Google GenAI não está configurada.";
    }

    const prompt = `
        Você é um redator de marketing para a empresa "${profile.name}". Sua tarefa é criar uma descrição curta e persuasiva para um produto ou serviço para ser usada no catálogo do Google Business Profile.

        Produto/Serviço:
        "${productName}"

        Características/Palavras-chave:
        "${keywords}"

        Instruções:
        - Crie uma descrição concisa (2-3 frases).
        - Foque nos benefícios para o cliente, não apenas nas características.
        - O tom deve ser convidativo e profissional.
        - O texto deve ser otimizado para convencer o cliente a escolher este produto/serviço.
        - Retorne apenas o texto da descrição, sem nenhuma introdução como "Aqui está a descrição:".
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const text = response.text;
        
        if (!text) {
            throw new Error('No description generated by Gemini API for product.');
        }

        return text.trim();

    } catch (error) {
        console.error("Error generating product description with Gemini API:", error);
        return "Ocorreu um erro ao gerar a descrição com a IA. Por favor, verifique sua chave de API e tente novamente.";
    }
};
