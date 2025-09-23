import React, { useState } from 'react';
import { NeumorphicCard, NeumorphicCardInset } from './NeumorphicCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { createSubscriptionPreference } from '../services/mercadoPagoService.ts';

// Define os planos disponíveis no aplicativo
const PLANS = {
  pro_monthly: { id: 'pro_monthly', name: 'Plano Pro Mensal', price: 47, cycle: 'monthly' },
  pro_yearly: { id: 'pro_yearly', name: 'Plano Pro Anual', price: 447, cycle: 'yearly' },
};

const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpgradeClick = async (planId: keyof typeof PLANS) => {
    if (!user || !user.email) {
      setError("Não foi possível identificar o usuário. Por favor, tente fazer login novamente.");
      return;
    }

    setIsLoading(planId);
    setError(null);

    try {
      const plan = PLANS[planId];
      const preference = await createSubscriptionPreference(plan.id, plan.name, plan.price, user.email);
      if (preference && preference.init_point) {
        window.location.href = preference.init_point;
      } else {
        throw new Error("Não foi possível criar o link de pagamento.");
      }
    } catch (err: any) {
      console.error("Erro ao criar preferência do Mercado Pago:", err);
      setError(err.message || 'Ocorreu um erro. Tente novamente mais tarde.');
      setIsLoading(null);
    }
  };
  
  const PlanTag: React.FC = () => (
    <div className="absolute top-0 right-4 -translate-y-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
      SEU PLANO
    </div>
  );

  return (
    <>
      <NeumorphicCard className="p-6 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Planos e Assinaturas</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Você está no plano <span className="font-bold capitalize">{user?.plan || 'Free'}</span>.
            Escolha um plano abaixo para desbloquear mais recursos.
          </p>
        </div>

        {error && (
            <div className="p-4 text-center rounded-lg bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">
                <p className="font-semibold">Erro</p>
                <p className="text-sm">{error}</p>
            </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-8">
            
            {/* Free Plan Card */}
            <NeumorphicCard className="p-6 space-y-4 !rounded-xl border-2 border-transparent flex flex-col relative">
                {(user?.plan === 'free' || !user) && <PlanTag />}
                <h4 className="text-xl font-bold text-slate-700 dark:text-slate-300">Plano Gratuito</h4>
                <div className="text-center">
                    <p className="text-3xl font-bold">R$0</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">para sempre</p>
                </div>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 flex-grow">
                    {['Acesso a todas as ferramentas de IA', '1 post gerado por semana', 'Respostas para avaliações, Q&A, etc.', 'Suporte via comunidade'].map(item => (
                        <li key={item} className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500">check_circle</span><span>{item}</span></li>
                    ))}
                </ul>
                <button 
                  disabled={true}
                  className="w-full mt-4 py-3 px-5 rounded-lg bg-slate-400 dark:bg-slate-600 text-white font-semibold cursor-not-allowed"
                >
                  Seu Plano Atual
                </button>
            </NeumorphicCard>

            {/* Pro Plan Card */}
            <NeumorphicCard className="p-6 space-y-4 !rounded-xl border-2 border-blue-500 relative flex flex-col">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">RECOMENDADO</div>
                {user?.plan === 'pro' && <PlanTag />}
                <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400">Plano Pro</h4>
                <div className="flex justify-center">
                    <NeumorphicCardInset className="p-1 rounded-full flex text-sm">
                        <button onClick={() => setBillingCycle('monthly')} className={`px-3 py-1 rounded-full font-semibold transition-colors ${billingCycle === 'monthly' ? 'bg-blue-500 text-white' : ''}`}>Mensal</button>
                        <button onClick={() => setBillingCycle('yearly')} className={`px-3 py-1 rounded-full font-semibold transition-colors ${billingCycle === 'yearly' ? 'bg-blue-500 text-white' : ''}`}>Anual</button>
                    </NeumorphicCardInset>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold">R${billingCycle === 'monthly' ? PLANS.pro_monthly.price : PLANS.pro_yearly.price}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">/{billingCycle === 'monthly' ? 'mês' : 'ano'}</p>
                    {billingCycle === 'yearly' && <p className="text-xs text-green-600 dark:text-green-400 font-semibold">Economize 2 meses</p>}
                </div>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 flex-grow">
                    <li className="font-bold">Tudo do plano Gratuito, e mais:</li>
                    {['Posts ilimitados', 'Respostas ilimitadas', 'Suporte prioritário via email'].map(item => (
                         <li key={item} className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500">add_circle</span><span>{item}</span></li>
                    ))}
                </ul>
                <button 
                  onClick={() => handleUpgradeClick(billingCycle === 'monthly' ? 'pro_monthly' : 'pro_yearly')} 
                  disabled={isLoading !== null || user?.plan === 'pro' || user?.plan === 'cortesia'}
                  className="w-full mt-4 py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading === `pro_${billingCycle}` ? 'Aguarde...' : (user?.plan === 'pro' ? 'Seu Plano Atual' : 'Fazer Upgrade')}
                </button>
            </NeumorphicCard>
            
            {/* Cortesia Plan Card */}
            <NeumorphicCard className="p-6 space-y-4 !rounded-xl border-2 border-transparent flex flex-col relative">
                {user?.plan === 'cortesia' && <PlanTag />}
                <h4 className="text-xl font-bold text-slate-700 dark:text-slate-300">Plano Cortesia</h4>
                 <div className="text-center flex-grow">
                    <p className="text-lg font-semibold mt-8">Acesso gratuito por 3 meses</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-4">
                        Este plano oferece todos os benefícios do Plano Pro gratuitamente por um período limitado. Geralmente é concedido para testes, parcerias ou promoções especiais.
                    </p>
                </div>
                <button disabled className="w-full mt-4 py-3 px-5 rounded-lg bg-slate-400 dark:bg-slate-600 text-white font-semibold cursor-not-allowed">
                    {user?.plan === 'cortesia' ? 'Seu Plano Atual' : 'Disponível por convite'}
                </button>
            </NeumorphicCard>

        </div>
      </NeumorphicCard>
    </>
  );
};

export default SubscriptionManager;