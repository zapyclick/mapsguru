import React, { useState } from 'react';
import Login from './Login.tsx';
import Register from './Register.tsx';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard.tsx';
import { isFirebaseConfigured } from '../../services/firebase.ts';

const Auth: React.FC = () => {
  const [isRegisterView, setIsRegisterView] = useState(false);

  const toggleView = () => setIsRegisterView(!isRegisterView);
  
  const firebaseReady = isFirebaseConfigured();

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100">
          Zmaps gestão inteligente para negócios locais
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Sua ferramenta de IA para dominar o Google.</p>
      </div>

      <NeumorphicCard className="w-full max-w-md p-8 space-y-6">
        {!firebaseReady ? (
            <div className="text-center space-y-4">
                <h2 className="text-xl font-bold text-amber-700 dark:text-amber-400">Configuração Necessária</h2>
                <p className="text-sm">
                    A autenticação do Firebase ainda não foi configurada.
                </p>
                <p className="text-sm bg-slate-300 dark:bg-slate-800 p-3 rounded-lg">
                    Para habilitar o login e o cadastro, por favor, edite o arquivo <code className="font-mono bg-slate-100 dark:bg-slate-700 p-1 rounded">services/firebase.ts</code> e cole suas credenciais do projeto Firebase.
                </p>
            </div>
        ) : (
            <>
                <h2 className="text-2xl font-bold text-center">
                {isRegisterView ? 'Crie sua conta' : 'Acesse sua conta'}
                </h2>
                
                {isRegisterView ? <Register /> : <Login />}

                <div className="text-center">
                <button onClick={toggleView} className="text-sm text-blue-500 hover:underline">
                    {isRegisterView ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Cadastre-se'}
                </button>
                </div>
            </>
        )}
      </NeumorphicCard>
    </div>
  );
};

export default Auth;
