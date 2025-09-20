
import React, { useState } from 'react';
import { signUp } from '../services/firebase';
import { NeumorphicCard, NeumorphicCardInset } from './NeumorphicCard';
import { logoDataUri } from '../assets/logo';


interface RegisterProps {
  onRegisterSuccess: () => void;
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if(password.length < 6){
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setIsLoading(true);
    try {
      await signUp(email, password);
      onRegisterSuccess();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else {
        setError('Ocorreu um erro ao criar a conta.');
      }
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
          <h2 className="text-2xl font-bold">Criar Nova Conta</h2>
          <p className="text-slate-600 dark:text-slate-400">Comece seu teste gratuito de 14 dias.</p>
        </div>

        {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="email-reg" className="block text-sm font-medium mb-2">Email</label>
            <NeumorphicCardInset className="p-1 rounded-lg">
              <input
                id="email-reg"
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
            <label htmlFor="password-reg" className="block text-sm font-medium mb-2">Senha</label>
            <NeumorphicCardInset className="p-1 rounded-lg">
              <input
                id="password-reg"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full bg-transparent p-3 outline-none"
              />
            </NeumorphicCardInset>
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">Confirmar Senha</label>
            <NeumorphicCardInset className="p-1 rounded-lg">
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
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
              {isLoading ? 'Criando...' : 'Criar Conta'}
            </button>
          </div>
        </form>
        <p className="text-center text-sm">
          Já tem uma conta?{' '}
          <button onClick={onSwitchToLogin} className="font-medium text-blue-600 hover:underline">
            Faça login
          </button>
        </p>
      </NeumorphicCard>
    </div>
  );
};

export default Register;
