
import React, { useState } from 'react';
import { signIn } from '../services/firebase';
import { NeumorphicCard, NeumorphicCardInset } from './NeumorphicCard';
import { logoDataUri } from '../assets/logo';

interface LoginProps {
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      setIsLoading(false);
      return;
    }
    
    try {
      await signIn(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setError('Falha no login. Verifique seu e-mail e senha.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200 dark:bg-slate-900 p-4">
      <NeumorphicCard className="w-full max-w-md p-8 space-y-6">
        <div className="text-center">
            <img src={logoDataUri} alt="Zmaps Logo" className="w-32 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Acessar sua Conta</h2>
            <p className="text-slate-600 dark:text-slate-400">Bem-vindo de volta!</p>
        </div>
        
        {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <NeumorphicCardInset className="p-1 rounded-lg">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full bg-transparent p-3 outline-none"
              />
            </NeumorphicCardInset>
          </div>
          <div>
            <label htmlFor="password"className="block text-sm font-medium mb-2">Senha</label>
            <NeumorphicCardInset className="p-1 rounded-lg">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-transparent p-3 outline-none"
              />
            </NeumorphicCardInset>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm">
          Não tem uma conta?{' '}
          <button onClick={onSwitchToRegister} className="font-medium text-blue-600 hover:underline">
            Crie uma agora
          </button>
        </p>
      </NeumorphicCard>
    </div>
  );
};

export default Login;
