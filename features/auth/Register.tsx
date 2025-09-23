import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { NeumorphicCardInset } from '../../components/ui/NeumorphicCard.tsx';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      await register(email, password);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao criar a conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="register-email" className="font-semibold block mb-2">Email</label>
        <NeumorphicCardInset className="p-1 rounded-lg">
          <input
            id="register-email"
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
        <label htmlFor="register-password" className="font-semibold block mb-2">Senha</label>
        <NeumorphicCardInset className="p-1 rounded-lg">
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Mínimo de 6 caracteres"
            className="w-full bg-transparent p-3 outline-none"
          />
        </NeumorphicCardInset>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-password" className="font-semibold block mb-2">Confirmar Senha</label>
        <NeumorphicCardInset className="p-1 rounded-lg">
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            placeholder="Repita a senha"
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
          {isLoading ? 'Criando conta...' : 'Cadastrar'}
        </button>
      </div>
    </form>
  );
};

export default Register;
