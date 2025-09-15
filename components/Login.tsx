import React, { useState } from 'react';
import { NeumorphicCard, NeumorphicCardInset } from './NeumorphicCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [users] = useLocalStorage<User[]>('users', []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Fallback para admin/password se não houver usuários e for o primeiro acesso
    if (users.length === 0 && email === 'admin@zmaps.com.br' && password === 'password') {
        const adminUser: User = {
            email: 'admin@zmaps.com.br',
            password: 'password',
            registrationDate: new Date().toISOString(),
            trialEndDate: new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString() // 5 anos de acesso
        };
        onLoginSuccess(adminUser);
        return;
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const trialEndDate = new Date(user.trialEndDate);
      if (trialEndDate < new Date()) {
        setError('Seu período de teste expirou.');
        return;
      }
      setError('');
      onLoginSuccess(user);
    } else {
      setError('E-mail ou senha inválidos.');
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
              />
            </NeumorphicCardInset>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center" role="alert">{error}</p>}

          <div>
            <button
              type="submit"
              className="w-full py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              Entrar
            </button>
          </div>
        </form>

        <div className="text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Não tem uma conta?{' '}
                <button onClick={onNavigateToRegister} className="font-semibold text-blue-500 hover:underline focus:outline-none">
                    Cadastre-se
                </button>
            </p>
        </div>

      </NeumorphicCard>
    </div>
  );
};

export default Login;