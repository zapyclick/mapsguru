// ATENÇÃO: Adicione a configuração do seu projeto Firebase aqui.
// Você pode encontrar essas credenciais no console do seu projeto Firebase:
// Configurações do projeto > Geral > Seus aplicativos > Configuração do SDK > Configuração.
// ---
// NOTA DE SEGURANÇA:
// Em um aplicativo de produção real, é altamente recomendável usar variáveis de ambiente
// para armazenar essas chaves, em vez de colocá-las diretamente no código.
// Isso evita a exposição acidental de suas credenciais.
// Ex: const firebaseConfig = { apiKey: process.env.REACT_APP_FIREBASE_API_KEY, ... };

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "COLE_AQUI_SUA_API_KEY",
  authDomain: "COLE_AQUI_SEU_AUTH_DOMAIN",
  projectId: "COLE_AQUI_SEU_PROJECT_ID",
  storageBucket: "COLE_AQUI_SEU_STORAGE_BUCKET",
  messagingSenderId: "COLE_AQUI_SEU_MESSAGING_SENDER_ID",
  appId: "COLE_AQUI_SEU_APP_ID"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços que serão utilizados
export const auth = getAuth(app);
export const db = getFirestore(app);