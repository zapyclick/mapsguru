import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '../../types/index.ts';
import { NeumorphicCard, NeumorphicCardInset } from '../../components/ui/NeumorphicCard.tsx';
import { IconButton } from '../../components/ui/IconButton.tsx';
import InfoModal from '../../components/ui/InfoModal.tsx';

interface BusinessProfileSetupProps {
  profile: BusinessProfile;
  onProfileChange: (updatedProfile: BusinessProfile) => void;
  onClose?: () => void; // Optional close handler for modal context
}

const BusinessProfileSetup: React.FC<BusinessProfileSetupProps> = ({ profile, onProfileChange, onClose }) => {
  const [localProfile, setLocalProfile] = useState(profile);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Sync local state if the prop from the parent changes
  useEffect(() => {
    setLocalProfile(profile);
  }, [profile]);
  
  const handleLocalChange = (updates: Partial<BusinessProfile>) => {
    setLocalProfile(prev => ({ ...prev, ...updates }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido.');
        return;
      }
      const fileSizeLimit = 2 * 1024 * 1024; // 2MB
      if (file.size > fileSizeLimit) {
        alert('O arquivo do logo é muito grande. Por favor, use uma imagem com menos de 2MB.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleLocalChange({ logoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSaveStatus('saving');
    onProfileChange(localProfile);
    
    // Simulate save and show feedback
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }, 300);
  };

  const hasChanges = JSON.stringify(localProfile) !== JSON.stringify(profile);

  return (
    <>
      <NeumorphicCard className="p-6">
        <div className="flex justify-between items-start mb-4 flex-wrap gap-y-2">
            <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Perfil do Negócio</h2>
                <IconButton onClick={() => setIsInfoModalOpen(true)} aria-label="Como funciona o Perfil do Negócio?" className="!w-8 !h-8">
                    <span className="material-symbols-outlined text-base">help_outline</span>
                </IconButton>
            </div>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Suas informações são salvas no seu navegador quando você clica em "Salvar".
        </p>
        <div className="space-y-4">
          <div>
            <label htmlFor="business-name" className="block text-sm font-medium mb-2">Nome da Empresa</label>
            <NeumorphicCardInset className="p-1 rounded-lg">
                <input
                  id="business-name"
                  type="text"
                  value={localProfile.name || ''}
                  onChange={(e) => handleLocalChange({ name: e.target.value })}
                  placeholder="Sua empresa LTDA"
                  className="w-full bg-transparent p-3 outline-none"
                />
            </NeumorphicCardInset>
          </div>
          <div>
            <label htmlFor="whatsapp-number" className="block text-sm font-medium mb-2">Nº de WhatsApp (com cód. do país)</label>
            <NeumorphicCardInset className="p-1 rounded-lg">
                <input
                  id="whatsapp-number"
                  type="tel"
                  value={localProfile.whatsappNumber || ''}
                  onChange={(e) => handleLocalChange({ whatsappNumber: e.target.value })}
                  placeholder="Ex: 5511999998888"
                  className="w-full bg-transparent p-3 outline-none"
                />
            </NeumorphicCardInset>
          </div>
          <div>
            <label htmlFor="gbp-link" className="block text-sm font-medium mb-2">Link do Perfil da Empresa no Google</label>
            <NeumorphicCardInset className="p-1 rounded-lg">
                <input
                  id="gbp-link"
                  type="url"
                  value={localProfile.gbpLink || ''}
                  onChange={(e) => handleLocalChange({ gbpLink: e.target.value })}
                  placeholder="Cole o link aqui. Ex: https://maps.app.goo.gl/..."
                  className="w-full bg-transparent p-3 outline-none"
                />
            </NeumorphicCardInset>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-1">
              <strong>Dica:</strong> Para um link mais curto, use a opção "Compartilhar" no perfil da sua empresa no Google Maps.
            </p>
          </div>
          <div>
              <label className="block text-sm font-medium mb-2">Logo da Empresa (Opcional)</label>
              {localProfile.logoUrl ? (
                  <div className="flex items-center gap-4">
                  <img src={localProfile.logoUrl} alt="Logo da empresa" className="w-16 h-16 object-contain rounded-md bg-white p-1 border border-slate-300 dark:border-slate-700" />
                  <button
                      onClick={() => handleLocalChange({ logoUrl: null })}
                      className="py-2 px-4 rounded-lg bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200 font-semibold hover:bg-red-300 dark:hover:bg-red-900 transition-colors text-sm"
                  >
                      Remover Logo
                  </button>
                  </div>
              ) : (
                  <div>
                  <label
                      htmlFor="logo-upload"
                      className="cursor-pointer py-3 px-5 rounded-lg bg-slate-300 dark:bg-slate-700 font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors inline-block"
                  >
                      Adicionar Logo
                  </label>
                  <input
                      id="logo-upload"
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      className="hidden"
                      onChange={handleLogoUpload}
                  />
                  </div>
              )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-300 dark:border-slate-700 flex justify-end items-center gap-4">
            <div className={`transition-opacity duration-300 ${saveStatus === 'saved' ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>Salvo!</span>
                </p>
            </div>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saveStatus !== 'idle'}
              className="py-2 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveStatus === 'saving' ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>

        {onClose && (
            <div className="mt-2 text-right">
                <button
                    onClick={onClose}
                    className="py-2 px-5 rounded-lg bg-slate-300 dark:bg-slate-700 font-semibold hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
                >
                    Fechar
                </button>
            </div>
        )}
      </NeumorphicCard>
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Como Funciona o Perfil do Negócio">
        <div className="space-y-3">
            <h3 className="font-bold text-lg">Por que é importante?</h3>
            <p>Preencher seu perfil é o passo mais importante para personalizar todas as ferramentas de IA. As informações que você fornece aqui são usadas para gerar textos, links e imagens que refletem a identidade da sua marca.</p>

            <h3 className="font-bold text-lg">Vantagens:</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Personalização Automática:</strong> Conteúdo gerado com a sua marca, sem esforço manual.</li>
                <li><strong>Consistência:</strong> Garante que todos os posts e respostas sigam o mesmo padrão de identidade.</li>
                <li><strong>Privacidade:</strong> Suas informações ficam salvas apenas no seu navegador, não são enviadas para nenhum servidor.</li>
            </ul>
        </div>
      </InfoModal>
    </>
  );
};

export default BusinessProfileSetup;