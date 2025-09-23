import { UnsplashImage } from '../types/index.ts';

const API_BASE_URL = 'https://api.unsplash.com';

// ATENÇÃO: Cole sua Chave de Acesso (Access Key) do Unsplash abaixo.
// SUBSTITUA O TEXTO 'COLE_AQUI_SUA_ACCESS_KEY_DO_UNSPLASH' PELA SUA CHAVE REAL.
// ---
// NOTA DE SEGURANÇA PARA PRODUÇÃO:
// Expor sua chave de API do Unsplash no código do frontend (cliente) não é seguro.
// Em um aplicativo real, essa chave deve ser movida para um backend (como uma Função Serverless)
// que atue como um proxy. O seu app faria uma chamada para o seu backend, e o seu backend,
// de forma segura, faria a chamada para a API do Unsplash.
// ---
const UNSPLASH_ACCESS_KEY: string = 'CGYigQ8Iy6Vg8jIY9yQNZ62Jn5dMV9iYd4vqUIg-QR0';

/**
 * Searches for images on Unsplash.
 * @param query - The search term for images.
 * @returns A promise that resolves to an array of UnsplashImage objects.
 * @throws An error with a user-friendly message if the API call fails.
 */
export const searchImages = async (query: string): Promise<UnsplashImage[]> => {
  // CORREÇÃO DEFINITIVA: Verifica se a chave foi alterada ou se ainda é o valor placeholder.
  if (!UNSPLASH_ACCESS_KEY || UNSPLASH_ACCESS_KEY === 'COLE_AQUI_SUA_ACCESS_KEY_DO_UNSPLASH') {
    // Lança um erro específico para que a UI possa informar o usuário.
    throw new Error('A chave da API do Unsplash não está configurada. Cole a chave em services/unsplashService.ts para buscar imagens.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=12&orientation=landscape`, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    });

    if (!response.ok) {
      let errorMessage = `Erro na API Unsplash: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData && errorData.errors) {
            errorMessage = `Erro na API Unsplash: ${errorData.errors.join(', ')}`;
        }
      } catch (e) {
        // Não foi possível parsear o JSON, use o statusText se disponível.
        if (response.statusText) {
          errorMessage += ` ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Error fetching from Unsplash API:", error);
    // Re-lança o erro para que o componente que chamou a função possa tratá-lo.
    throw error;
  }
};
