
import { UnsplashImage } from '../types/index.ts';

const API_BASE_URL = 'https://api.unsplash.com';

// PROFESIONALIZADO: Lê a chave da API a partir das variáveis de ambiente.
// O `as string` garante ao TypeScript que essa variável existirá.
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY as string;
const UNSPLASH_PLACEHOLDER = "SUA_CHAVE_DE_ACESSO_DO_UNSPLASH";


/**
 * Checks if the Unsplash API key has been configured by the user.
 * @returns {boolean} True if the key is configured, false otherwise.
 */
export const isUnsplashConfigured = (): boolean => {
    return !!UNSPLASH_ACCESS_KEY && UNSPLASH_ACCESS_KEY !== UNSPLASH_PLACEHOLDER;
};


/**
 * Searches for images on Unsplash.
 * @param query - The search term for images.
 * @returns A promise that resolves to an array of UnsplashImage objects.
 * @throws An error with a user-friendly message if the API call fails.
 */
export const searchImages = async (query: string): Promise<UnsplashImage[]> => {
  // CORREÇÃO DEFINITIVA: Verifica se a chave foi alterada ou se ainda é o valor placeholder.
  if (!isUnsplashConfigured()) {
    // Lança um erro específico para que a UI possa informar o usuário.
    throw new Error('A chave da API do Unsplash não está configurada. Siga as instruções para habilitar a busca de imagens.');
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
