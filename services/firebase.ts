import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ==========================================================================================
// AÇÃO NECESSÁRIA: CONFIGURAÇÃO DO FIREBASE
// ==========================================================================================
// O objeto `firebaseConfig` abaixo contém chaves de um projeto de EXEMPLO.
// Para que o login, cadastro e o banco de dados funcionem, você PRECISA substituí-lo
// pelas chaves do SEU PRÓPRIO projeto Firebase.
//
// COMO OBTER AS SUAS CHAVES:
// 1. Vá para o Console do Firebase: https://console.firebase.google.com/
// 2. Selecione o seu projeto (ou crie um novo).
// 3. Clique no ícone de engrenagem (Configurações do projeto) no canto superior esquerdo.
// 4. Na aba "Geral", role para baixo até a seção "Seus apps".
// 5. Se você ainda não registrou um app da web, clique no ícone `</>` para adicionar um.
// 6. Na configuração do app, você encontrará o objeto `firebaseConfig`. Copie e cole ele inteiro aqui.
// ==========================================================================================
const firebaseConfig = {
  // COLE A CONFIGURAÇÃO DO SEU PROJETO FIREBASE AQUI
  apiKey: "AIzaSyAneBXMvCiDC5STcsTxvn4Byn70LXSXwQM",
  authDomain: "mapszapy.firebaseapp.com",
  projectId: "mapszapy",
  storageBucket: "mapszapy.firebasestorage.app",
  messagingSenderId: "289369633409",
  appId: "1:289369633409:web:cf75117d9ae02f5f58d380"
};


// Inicializa o Firebase com a nova sintaxe modular
const app = initializeApp(firebaseConfig);

// Exporta as instâncias dos serviços que serão usados no aplicativo
export const auth = getAuth(app);
export const db = getFirestore(app);
