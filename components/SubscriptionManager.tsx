import React, { useState } from 'react';
import { NeumorphicCard, NeumorphicCardInset } from './NeumorphicCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { createSubscriptionPreference } from '../services/mercadoPagoService.ts';

// Define os planos disponíveis no aplicativo
const PLANS = {
  pro_monthly: { id: 'pro_monthly', name: 'Plano Pro Mensal', price: 47, cycle: 'monthly', level: 'pro' },
  pro_yearly: { id: 'pro_yearly', name: 'Plano Pro Anual', price: 447, cycle: 'yearly', level: 'pro' },
  premium_monthly: { id: 'premium_monthly', name: 'Plano Premium Mensal', price: 97, cycle: 'monthly', level: 'premium' },
  premium_yearly: { id: 'premium_yearly', name: 'Plano Premium Anual', price: 897, cycle: 'yearly', level: 'premium' },
};

interface BillingCycles {
  pro: 'monthly' | 'yearly';
  premium: 'monthly' | 'yearly';
}

const SubscriptionManager: React.FC = () => {
  const { user } = useAuth();
  const [billingCycles, setBillingCycles] = useState<BillingCycles>({ pro: 'monthly', premium: 'monthly' });
  const [isLoading, setIsLoading] = useState<string | null>(null); // Stores the ID of the plan being loaded
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
        // Redireciona o usuário para o checkout do Mercado Pago
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
  
  const PlanTag: React.FC<{ planName: string }> = ({ planName }) => (
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
        
        <div className="space-y-4 pt-6 border-t border-slate-300 dark:border-slate-700">
            <div className="grid md:grid-cols-3 gap-6">
                
                {/* Pro Plan Card */}
                <NeumorphicCard className="p-6 space-y-4 !rounded-xl border-2 border-transparent hover:border-blue-500 transition-colors flex flex-col relative">
                    {user?.plan === 'pro' && <PlanTag planName="Pro" />}
                    <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400">Plano Pro</h4>
                    <div className="flex justify-center">
                        <NeumorphicCardInset className="p-1 rounded-full flex text-sm">
                            <button onClick={() => setBillingCycles(p => ({...p, pro: 'monthly'}))} className={`px-3 py-1 rounded-full font-semibold transition-colors ${billingCycles.pro === 'monthly' ? 'bg-blue-500 text-white' : ''}`}>Mensal</button>
                            <button onClick={() => setBillingCycles(p => ({...p, pro: 'yearly'}))} className={`px-3 py-1 rounded-full font-semibold transition-colors ${billingCycles.pro === 'yearly' ? 'bg-blue-500 text-white' : ''}`}>Anual</button>
                        </NeumorphicCardInset>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold">R${billingCycles.pro === 'monthly' ? PLANS.pro_monthly.price : PLANS.pro_yearly.price}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">/{billingCycles.pro === 'monthly' ? 'mês' : 'ano'}</p>
                        {billingCycles.pro === 'yearly' && <p className="text-xs text-green-600 dark:text-green-400 font-semibold">20% de desconto</p>}
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 flex-grow">
                        {['Todas as ferramentas de IA', 'Geração ilimitada de posts', 'Respostas ilimitadas', 'Suporte prioritário'].map(item => (
                            <li key={item} className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500">check_circle</span><span>{item}</span></li>
                        ))}
                    </ul>
                    <button 
                      onClick={() => handleUpgradeClick(billingCycles.pro === 'monthly' ? 'pro_monthly' : 'pro_yearly')} 
                      disabled={isLoading !== null || user?.plan === 'pro' || user?.plan === 'premium'}
                      className="w-full mt-4 py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading === `pro_${billingCycles.pro}` ? 'Aguarde...' : (user?.plan === 'pro' ? 'Seu Plano Atual' : 'Assinar Agora')}
                    </button>
                </NeumorphicCard>

                {/* Premium Plan Card */}
                <NeumorphicCard className="p-6 space-y-4 !rounded-xl border-2 border-blue-500 transition-colors relative flex flex-col">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">MAIS POPULAR</div>
                    {user?.plan === 'premium' && <PlanTag planName="Premium" />}
                    <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400">Plano Premium</h4>
                     <div className="flex justify-center">
                        <NeumorphicCardInset className="p-1 rounded-full flex text-sm">
                            <button onClick={() => setBillingCycles(p => ({...p, premium: 'monthly'}))} className={`px-3 py-1 rounded-full font-semibold transition-colors ${billingCycles.premium === 'monthly' ? 'bg-blue-500 text-white' : ''}`}>Mensal</button>
                            <button onClick={() => setBillingCycles(p => ({...p, premium: 'yearly'}))} className={`px-3 py-1 rounded-full font-semibold transition-colors ${billingCycles.premium === 'yearly' ? 'bg-blue-500 text-white' : ''}`}>Anual</button>
                        </NeumorphicCardInset>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold">R${billingCycles.premium === 'monthly' ? PLANS.premium_monthly.price : PLANS.premium_yearly.price}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">/{billingCycles.premium === 'monthly' ? 'mês' : 'ano'}</p>
                        {billingCycles.premium === 'yearly' && <p className="text-xs text-green-600 dark:text-green-400 font-semibold">23% de desconto</p>}
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 flex-grow">
                        <li className="font-bold">Tudo do plano Pro, e mais:</li>
                        {['Atualizações trimestrais do perfil', '2 mentorias online de 1h/ano'].map(item => (
                             <li key={item} className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500">add_circle</span><span>{item}</span></li>
                        ))}
                    </ul>
                    <button 
                      onClick={() => handleUpgradeClick(billingCycles.premium === 'monthly' ? 'premium_monthly' : 'premium_yearly')} 
                      disabled={isLoading !== null || user?.plan === 'premium'}
                      className="w-full mt-4 py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading === `premium_${billingCycles.premium}` ? 'Aguarde...' : (user?.plan === 'premium' ? 'Seu Plano Atual' : 'Assinar Agora')}
                    </button>
                </NeumorphicCard>

                {/* Enterprise Plan Card */}
                <NeumorphicCard className="p-6 space-y-4 !rounded-xl border-2 border-transparent flex flex-col">
                    <h4 className="text-xl font-bold">Enterprise</h4>
                     <div className="text-center flex-grow">
                        <p className="text-lg font-semibold mt-8">Preço sob consulta</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-4">
                            Gerencia múltiplos clientes ou locais? Entre em contato para um plano personalizado com descontos por volume e recursos para agências.
                        </p>
                    </div>
                    <button disabled className="w-full mt-4 py-3 px-5 rounded-lg bg-slate-400 dark:bg-slate-600 text-white font-semibold cursor-not-allowed">
                        Entre em contato
                    </button>
                </NeumorphicCard>
            </div>
        </div>
      </NeumorphicCard>
    </>
  );
};

export default SubscriptionManager;