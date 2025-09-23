// Importa as funções necessárias dos SDKs que você precisa
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// Usaremos initializeFirestore para aplicar configurações específicas
// FIX: Importa persistentSingleTabManager para configurar corretamente a persistência de aba única.
import { initializeFirestore, persistentLocalCache, persistentSingleTabManager } from 'firebase/firestore';

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
  storageBucket: "mapszapy.appspot.com",
  messagingSenderId: "289369633409",
  appId: "1:289369633409:web:cf75117d9ae02f5f58d380"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que serão usados no aplicativo
export const auth = getAuth(app);

// Inicializa o Firestore com long polling forçado e cache de aba única.
// O `experimentalForceLongPolling` é uma configuração mais agressiva que força o SDK
// a usar o método de conexão HTTPS, que é mais robusto em redes restritivas
// (com firewalls, proxies, etc.) onde a detecção automática pode falhar.
// Embora preterido, é a solução mais eficaz para o erro '[code=unavailable]'.
// O gerenciador de abas único (`persistentSingleTabManager`) previne a sincronização do
// cache entre múltiplas abas, o que aumenta a estabilidade.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  localCache: persistentLocalCache({ tabManager: persistentSingleTabManager() })
});


/**
 * Verifica se as credenciais do Firebase parecem ter sido preenchidas.
 * @returns {boolean} True se a configuração não for mais o valor placeholder.
 */
export const isFirebaseConfigured = (): boolean => {
    // Verifica se a chave de API é diferente dos valores de placeholder comuns
    return firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("COLE_SUA_API_KEY_AQUI");
}