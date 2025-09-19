import React, { useState } from 'react';
import { User } from '../types';
import { NeumorphicCard, NeumorphicCardInset } from './NeumorphicCard';

interface SubscriptionManagerProps {
  currentUser: User | null;
  onUpgradePlan: (email: string, plan: 'pro' | 'premium') => void;
}

// FIX: Define a specific type for billing cycles to ensure type safety.
// This prevents string values other than 'monthly' or 'yearly' from being used,
// resolving the TypeScript error where a generic 'string' was not assignable
// to the more specific '"monthly" | "yearly"' type required by `handleUpgradeClick`.
interface BillingCycles {
  pro: 'monthly' | 'yearly';
  premium: 'monthly' | 'yearly';
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ currentUser, onUpgradePlan }) => {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{ plan: 'pro' | 'premium', cycle: 'monthly' | 'yearly' } | null>(null);
  // FIX: Apply the BillingCycles type to the state for type safety. This resolves compilation errors on lines 153 and 177.
  const [billingCycles, setBillingCycles] = useState<BillingCycles>({ pro: 'monthly', premium: 'monthly' });

  if (!currentUser) {
    return (
      <NeumorphicCard className="p-6 text-center">
        <p>Carregando informações do usuário...</p>
      </NeumorphicCard>
    );
  }

  const getPlanName = (plan: User['plan']) => {
    switch (plan) {
      case 'trial':
        return 'Plano Teste (Free)';
      case 'pro':
        return 'Plano Pro';
      case 'premium':
        return 'Plano Premium';
      case 'admin':
        return 'Administrador';
      default:
        return 'Desconhecido';
    }
  };
  
  const handleUpgradeClick = (plan: 'pro' | 'premium', cycle: 'monthly' | 'yearly') => {
    setSelectedPlan({ plan, cycle });
    setIsConfirmationModalOpen(true);
  }

  const handleConfirmPayment = () => {
    if (currentUser && selectedPlan) {
      onUpgradePlan(currentUser.email, selectedPlan.plan);
    }
    setIsConfirmationModalOpen(false);
    setSelectedPlan(null);
  }

  const TrialStatus = () => {
    if (currentUser.plan !== 'trial' || !currentUser.trialEndDate) return null;

    const endDate = new Date(currentUser.trialEndDate);
    const now = new Date();
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysRemaining <= 0) {
      return (
        <p className="text-sm text-red-600 dark:text-red-400">
          Seu período de teste expirou.
        </p>
      );
    }
    return (
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Seu teste termina em <strong>{daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}</strong>.
      </p>
    );
  };

  const ConfirmationModal = () => {
    if (!selectedPlan) return null;
    const planName = selectedPlan.plan === 'pro' ? 'Pro' : 'Premium';
    const cycleName = selectedPlan.cycle === 'monthly' ? 'Mensal' : 'Anual';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
            <NeumorphicCard className="w-full max-w-md p-6 space-y-4">
                <h3 className="text-xl font-bold">Confirmar Upgrade</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                    Você está assinando o <strong>Plano {planName} ({cycleName})</strong>.
                    <br/><br/>
                    Você será redirecionado para o checkout seguro do Mercado Pago para concluir sua assinatura. Após a confirmação do pagamento, seu plano será atualizado instantaneamente.
                </p>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-300 dark:border-slate-700">
                    <button 
                        onClick={() => setIsConfirmationModalOpen(false)}
                        className="py-2 px-5 rounded-lg bg-slate-300 dark:bg-slate-700 font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleConfirmPayment}
                        className="py-2 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                    >
                        Ir para Pagamento
                    </button>
                </div>
            </NeumorphicCard>
        </div>
    )
  };

  return (
    <>
      <NeumorphicCard className="p-6 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Plano</h2>
          <p className="text-slate-600 dark:text-slate-400">Veja seu plano atual e opções de upgrade.</p>
        </div>

        {/* Current Plan Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Seu Plano Atual</h3>
          <NeumorphicCard className="!rounded-xl p-6 border border-blue-500/30">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{getPlanName(currentUser.plan)}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">Email: {currentUser.email}</p>
              </div>
              <div className="text-left sm:text-right">
                <TrialStatus />
              </div>
            </div>
          </NeumorphicCard>
        </div>
        
        {/* Upgrade Section - Only show if not already pro/admin */}
        {(currentUser.plan === 'trial' || currentUser.plan === 'pro') && (
          <div className="space-y-4 pt-6 border-t border-slate-300 dark:border-slate-700">
            <h3 className="font-bold text-lg">Opções de Upgrade</h3>
            <div className="grid md:grid-cols-3 gap-6">
                {/* Pro Plan Card */}
                <NeumorphicCard className="p-6 space-y-4 !rounded-xl border-2 border-transparent hover:border-blue-500 transition-colors flex flex-col">
                    <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400">Plano Pro</h4>
                    <div className="flex justify-center">
                        <NeumorphicCardInset className="p-1 rounded-full flex text-sm">
                            <button onClick={() => setBillingCycles(p => ({...p, pro: 'monthly'}))} className={`px-3 py-1 rounded-full font-semibold transition-colors ${billingCycles.pro === 'monthly' ? 'bg-blue-500 text-white' : ''}`}>Mensal</button>
                            <button onClick={() => setBillingCycles(p => ({...p, pro: 'yearly'}))} className={`px-3 py-1 rounded-full font-semibold transition-colors ${billingCycles.pro === 'yearly' ? 'bg-blue-500 text-white' : ''}`}>Anual</button>
                        </NeumorphicCardInset>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold">R${billingCycles.pro === 'monthly' ? '47' : '447'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">/{billingCycles.pro === 'monthly' ? 'mês' : 'ano'}</p>
                        {billingCycles.pro === 'yearly' && <p className="text-xs text-green-600 dark:text-green-400 font-semibold">20% de desconto</p>}
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 flex-grow">
                        {['Todas as ferramentas de IA', 'Geração ilimitada de posts', 'Respostas ilimitadas', 'Suporte prioritário'].map(item => (
                            <li key={item} className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500">check_circle</span><span>{item}</span></li>
                        ))}
                    </ul>
                    <button onClick={() => handleUpgradeClick('pro', billingCycles.pro)} className="w-full mt-4 py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors">Fazer Upgrade</button>
                </NeumorphicCard>

                {/* Premium Plan Card */}
                <NeumorphicCard className="p-6 space-y-4 !rounded-xl border-2 border-blue-500 transition-colors relative flex flex-col">
                    <div className="absolute top-0 right-4 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">MAIS POPULAR</div>
                    <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400">Plano Premium</h4>
                     <div className="flex justify-center">
                        <NeumorphicCardInset className="p-1 rounded-full flex text-sm">
                            <button onClick={() => setBillingCycles(p => ({...p, premium: 'monthly'}))} className={`px-3 py-1 rounded-full font-semibold transition-colors ${billingCycles.premium === 'monthly' ? 'bg-blue-500 text-white' : ''}`}>Mensal</button>
                            <button onClick={() => setBillingCycles(p => ({...p, premium: 'yearly'}))} className={`px-3 py-1 rounded-full font-semibold transition-colors ${billingCycles.premium === 'yearly' ? 'bg-blue-500 text-white' : ''}`}>Anual</button>
                        </NeumorphicCardInset>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-bold">R${billingCycles.premium === 'monthly' ? '97' : '897'}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">/{billingCycles.premium === 'monthly' ? 'mês' : 'ano'}</p>
                        {billingCycles.premium === 'yearly' && <p className="text-xs text-green-600 dark:text-green-400 font-semibold">23% de desconto</p>}
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 flex-grow">
                        <li className="font-bold">Tudo do plano Pro, e mais:</li>
                        {['Atualizações trimestrais do perfil', '2 mentorias online de 1h/ano'].map(item => (
                             <li key={item} className="flex items-center gap-2"><span className="material-symbols-outlined text-green-500">add_circle</span><span>{item}</span></li>
                        ))}
                    </ul>
                    <button onClick={() => handleUpgradeClick('premium', billingCycles.premium)} className="w-full mt-4 py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors">Fazer Upgrade</button>
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
        )}

      </NeumorphicCard>
      
      {isConfirmationModalOpen && <ConfirmationModal />}
    </>
  );
};

export default SubscriptionManager;