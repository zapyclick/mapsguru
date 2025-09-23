import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { NeumorphicCardInset } from '../../components/ui/NeumorphicCard.tsx';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      // O sucesso redireciona automaticamente via `App.tsx`
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="login-email" className="font-semibold block mb-2">Email</label>
        <NeumorphicCardInset className="p-1 rounded-lg">
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="seu@email.com"
            className="w-full bg-transparent p-3 outline-none"
          />
        </NeumorphicCardInset>
      </div>
      <div className="space-y-2">
        <label htmlFor="login-password" className="font-semibold block mb-2">Senha</label>
        <NeumorphicCardInset className="p-1 rounded-lg">
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="********"
            className="w-full bg-transparent p-3 outline-none"
          />
        </NeumorphicCardInset>
      </div>
      
      {error && <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>}

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
  );
};

export default Login;
