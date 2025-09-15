import React, { useState } from 'react';
import { NeumorphicCard, NeumorphicCardInset } from './NeumorphicCard';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { FirebaseError } from 'firebase/app';

interface LoginProps {
  onNavigateToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // O onAuthStateChanged em App.tsx cuidará do redirecionamento e estado.
    } catch (err: unknown) {
        // FIX: The error is of type 'unknown' in a catch block. Added a type guard to check if 'err' is an instance of 'FirebaseError' before accessing its 'code' property. This resolves the TypeScript error.
        if (err instanceof FirebaseError) {
            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('E-mail ou senha inválidos.');
                    break;
                case 'auth/invalid-email':
                    setError('O formato do e-mail é inválido.');
                    break;
                default:
                    setError('Ocorreu um erro ao fazer login. Tente novamente.');
                    break;
            }
        } else {
             setError('Ocorreu um erro desconhecido.');
        }
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-200 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4 transition-colors duration-300 font-sans">
      <NeumorphicCard className="w-full max-w-sm p-8 space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                Zmaps
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                gestão inteligente para negócios locais
            </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">E-mail</label>
            <NeumorphicCardInset className="p-1 rounded-lg">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                className="w-full bg-transparent p-3 outline-none"
                required
                aria-required="true"
                autoComplete="email"
                disabled={isLoading}
              />
            </NeumorphicCardInset>
          </div>
          <div>
            <label htmlFor="password"  className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Senha</label>
            <NeumorphicCardInset className="p-1 rounded-lg">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full bg-transparent p-3 outline-none"
                required
                aria-required="true"
                autoComplete="current-password"
                disabled={isLoading}
              />
            </NeumorphicCardInset>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center" role="alert">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Não tem uma conta?{' '}
                <button onClick={onNavigateToRegister} className="font-semibold text-blue-500 hover:underline focus:outline-none" disabled={isLoading}>
                    Cadastre-se
                </button>
            </p>
        </div>

      </NeumorphicCard>
    </div>
  );
};

export default Login;