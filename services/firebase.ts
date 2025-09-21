// FIX: The user's environment seems to have trouble with the named export for `initializeApp`.
// Switching to a namespace import is a more robust way to handle potential module resolution issues.
import * as firebaseApp from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ===================================================================================
// ATENÇÃO: COLE SUAS CREDENCIAIS DO FIREBASE AQUI
// 1. Vá para o console do Firebase: https://console.firebase.google.com/
// 2. Crie um novo projeto ou selecione um existente.
// 3. Vá para as Configurações do Projeto (ícone de engrenagem).
// 4. Na aba "Geral", role para baixo até "Seus apps".
// 5. Clique no ícone da web "</>" para criar ou ver a configuração do seu app da web.
// 6. Copie o objeto `firebaseConfig` e cole-o abaixo, substituindo o objeto de exemplo.
// ===================================================================================

const firebaseConfig = {
  apiKey: "AIzaSyAneBXMvCiDC5STcsTxvn4Byn70LXSXwQM",
  authDomain: "mapszapy.firebaseapp.com",
  projectId: "mapszapy",
  storageBucket: "mapszapy.firebasestorage.app",
  messagingSenderId: "289369633409",
  appId: "1:289369633409:web:cf75117d9ae02f5f58d380"
};

// Inicializa o Firebase
const app = firebaseApp.initializeApp(firebaseConfig);

// Exporta os serviços que serão usados no aplicativo
export const auth = getAuth(app);
export const db = getFirestore(app);

/**
 * Verifica se as credenciais do Firebase parecem ter sido preenchidas.
 * @returns {boolean} True se a configuração não for mais o valor placeholder.
 */
export const isFirebaseConfigured = (): boolean => {
    return firebaseConfig.apiKey !== "COLE_SUA_API_KEY_AQUI" && firebaseConfig.apiKey !== "";
}