import React, { useState } from 'react';
import { NeumorphicCard, NeumorphicCardInset } from './NeumorphicCard';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { FirebaseError } from 'firebase/app';

interface RegisterProps {
    onNavigateToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        
        setIsLoading(true);

        try {
            // 1. Criar o usuário no Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Criar o documento do usuário no Firestore
            const registrationDate = new Date();
            const trialEndDate = new Date();
            trialEndDate.setDate(registrationDate.getDate() + 14); // Teste de 14 dias

            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                registrationDate: registrationDate.toISOString(),
                trialEndDate: trialEndDate.toISOString(),
                plan: 'trial', // Define o plano inicial
            });
            
            setSuccess('Cadastro realizado com sucesso! Você será redirecionado para o login.');
            
            setTimeout(() => {
                onNavigateToLogin();
            }, 2500);

        } catch (err: unknown) {
            // FIX: The error is of type 'unknown' in a catch block. Added a type guard to check if 'err' is an instance of 'FirebaseError' before accessing its 'code' property. This resolves the TypeScript errors.
            if (err instanceof FirebaseError) {
                if (err.code === 'auth/email-already-in-use') {
                    setError('Este e-mail já está em uso.');
                } else if (err.code === 'auth/weak-password') {
                    setError('A senha deve ter pelo menos 6 caracteres.');
                } else {
                    setError('Ocorreu um erro ao criar a conta. Tente novamente.');
                }
            } else {
                setError('Ocorreu um erro desconhecido.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-200 dark:bg-slate-900 min-h-screen flex items-center justify-center p-4 transition-colors duration-300 font-sans">
            <NeumorphicCard className="w-full max-w-sm p-8 space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        Criar Conta
                    </h1>
                     <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Zmaps gestão inteligente
                    </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label htmlFor="email-register" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">E-mail</label>
                        <NeumorphicCardInset className="p-1 rounded-lg">
                            <input
                                id="email-register"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu-email@dominio.com"
                                className="w-full bg-transparent p-3 outline-none"
                                required
                                aria-required="true"
                                autoComplete="email"
                                disabled={isLoading}
                            />
                        </NeumorphicCardInset>
                    </div>
                    <div>
                        <label htmlFor="password-register" className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Senha</label>
                        <NeumorphicCardInset className="p-1 rounded-lg">
                            <input
                                id="password-register"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Crie uma senha (mín. 6 caracteres)"
                                className="w-full bg-transparent p-3 outline-none"
                                required
                                aria-required="true"
                                autoComplete="new-password"
                                disabled={isLoading}
                            />
                        </NeumorphicCardInset>
                    </div>
                    <div>
                        <label htmlFor="confirm-password"  className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Confirmar Senha</label>
                        <NeumorphicCardInset className="p-1 rounded-lg">
                            <input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repita a senha"
                                className="w-full bg-transparent p-3 outline-none"
                                required
                                aria-required="true"
                                autoComplete="new-password"
                                disabled={isLoading}
                            />
                        </NeumorphicCardInset>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center" role="alert">{error}</p>}
                    {success && <p className="text-green-600 dark:text-green-400 text-sm text-center" role="status">{success}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !!success}
                            className="w-full py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Já tem uma conta?{' '}
                        <button onClick={onNavigateToLogin} className="font-semibold text-blue-500 hover:underline focus:outline-none" disabled={isLoading}>
                            Faça login
                        </button>
                    </p>
                </div>

            </NeumorphicCard>
        </div>
    );
};

export default Register;