import React, { useState } from 'react';
import { User } from '../types';
import { NeumorphicCard } from './NeumorphicCard';

interface SubscriptionManagerProps {
  currentUser: User | null;
  onUpgradePlan: (email: string, plan: 'pro') => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ currentUser, onUpgradePlan }) => {
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  
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
        return 'Plano Teste';
      case 'pro':
        return 'Plano Pro';
      case 'admin':
        return 'Administrador';
      default:
        return 'Desconhecido';
    }
  };
  
  const handleUpgradeClick = () => {
    setIsConfirmationModalOpen(true);
  }

  const handleConfirmPayment = () => {
    if (currentUser) {
      onUpgradePlan(currentUser.email, 'pro');
    }
    setIsConfirmationModalOpen(false);
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

  const ConfirmationModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
        <NeumorphicCard className="w-full max-w-md p-6 space-y-4">
            <h3 className="text-xl font-bold">Confirmar Upgrade</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300">
                Você será redirecionado para o checkout seguro do Mercado Pago para concluir sua assinatura. Após a confirmação do pagamento, seu plano será atualizado para Pro instantaneamente.
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
                    Confirmar Pagamento e Ativar Plano
                </button>
            </div>
        </NeumorphicCard>
    </div>
  );

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
        {currentUser.plan === 'trial' && (
          <div className="space-y-4 pt-6 border-t border-slate-300 dark:border-slate-700">
            <h3 className="font-bold text-lg">Opções de Upgrade</h3>
            <div className="grid md:grid-cols-2 gap-6">
                {/* Pro Plan Card */}
                <NeumorphicCard className="p-6 space-y-4 !rounded-xl border-2 border-transparent hover:border-blue-500 transition-colors">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400">Plano Pro</h4>
                        <div className="text-right">
                            <p className="text-2xl font-bold">R$49,90</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">/mês</p>
                        </div>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            <span>Todas as ferramentas de IA</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            <span>Geração ilimitada de posts</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            <span>Respostas ilimitadas</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                            <span>Suporte prioritário</span>
                        </li>
                    </ul>
                    <button 
                      onClick={handleUpgradeClick}
                      className="w-full mt-4 py-3 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
                    >
                        Fazer Upgrade
                    </button>
                </NeumorphicCard>

                {/* Enterprise/Custom Plan Card (Optional) */}
                <NeumorphicCard className="p-6 space-y-4 !rounded-xl border-2 border-transparent">
                    <div className="flex justify-between items-center">
                        <h4 className="text-xl font-bold">Agências</h4>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        Gerencia múltiplos clientes? Entre em contato para um plano personalizado com descontos por volume e recursos para equipes.
                    </p>
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