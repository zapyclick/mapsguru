import React, { useState } from 'react';
import { NeumorphicCard, NeumorphicCardInset } from './NeumorphicCard.tsx';

// ===================================================================================
// ATENÇÃO: É AQUI QUE VOCÊ COLOCA SEUS LINKS DE PAGAMENTO!
// 1. Crie os links de pagamento na sua plataforma (Mercado Pago, Stripe, etc.).
// 2. Cole cada link no lugar correspondente abaixo.
// ===================================================================================
const PAYMENT_LINKS = {
  pro: {
    monthly: 'https://SEU_LINK_DE_PAGAMENTO_AQUI', // Ex: https://mpago.la/123xyz
    yearly: 'https://SEU_LINK_DE_PAGAMENTO_AQUI',
  },
  premium: {
    monthly: 'https://SEU_LINK_DE_PAGAMENTO_AQUI',
    yearly: 'https://SEU_LINK_DE_PAGAMENTO_AQUI',
  },
};

interface BillingCycles {
  pro: 'monthly' | 'yearly';
  premium: 'monthly' | 'yearly';
}

const SubscriptionManager: React.FC = () => {
  const [billingCycles, setBillingCycles] = useState<BillingCycles>({ pro: 'monthly', premium: 'monthly' });

  const handleUpgradeClick = (paymentUrl: string) => {
    if (!paymentUrl || paymentUrl.includes('SEU_LINK_DE_PAGAMENTO_AQUI')) {
      alert('O link de pagamento para este plano ainda não foi configurado.');
      return;
    }
    window.open(paymentUrl, '_blank');
  };

  return (
    <>
      <NeumorphicCard className="p-6 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Planos e Assinaturas</h2>
          <p className="text-slate-600 dark:text-slate-400">Escolha o plano que melhor se adapta às suas necessidades.</p>
        </div>
        
        {/* Upgrade Section */}
        <div className="space-y-4 pt-6 border-t border-slate-300 dark:border-slate-700">
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
                    <button onClick={() => handleUpgradeClick(PAYMENT_LINKS.pro[billingCycles.pro])} className="w-full mt-4 py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors">Assinar Agora</button>
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
                    <button onClick={() => handleUpgradeClick(PAYMENT_LINKS.premium[billingCycles.premium])} className="w-full mt-4 py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors">Assinar Agora</button>
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