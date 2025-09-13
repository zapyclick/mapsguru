import React, { useState, useRef, useEffect } from 'react';
import { BusinessProfile } from '../types';
import { NeumorphicCard, NeumorphicCardInset } from './NeumorphicCard';
import { IconButton } from './IconButton';
import InfoModal from './InfoModal';

interface BusinessProfileSetupProps {
  profile: BusinessProfile;
  onProfileChange: (updatedProfile: Partial<BusinessProfile>) => void;
  onClose?: () => void; // Optional close handler for modal context
}

const BusinessProfileSetup: React.FC<BusinessProfileSetupProps> = ({ profile, onProfileChange, onClose }) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const debounceTimeoutRef = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  // Efeito para mostrar a mensagem "Salvo" após o usuário parar de digitar
  useEffect(() => {
    // Pula o efeito na primeira renderização
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Limpa o timeout existente para reiniciar o temporizador de debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Define um novo timeout
    debounceTimeoutRef.current = window.setTimeout(() => {
      setIsSaved(true); // Mostra a mensagem "Salvo"
      
      // Define outro timeout para esconder a mensagem após alguns segundos
      debounceTimeoutRef.current = window.setTimeout(() => {
        setIsSaved(false);
      }, 2500); // Esconde a mensagem após 2.5 segundos
    }, 1000); // Ativa após 1 segundo de inatividade

    // Função de limpeza para limpar o timeout se o componente for desmontado
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [profile]); // Este efeito é executado sempre que o objeto de perfil muda

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido.');
        return;
      }
      
      // Adiciona uma verificação de tamanho para evitar erros de cota do localStorage
      const fileSizeLimit = 2 * 1024 * 1024; // 2MB
      if (file.size > fileSizeLimit) {
        alert('O arquivo do logo é muito grande. Por favor, use uma imagem com menos de 2MB para garantir que seja salvo corretamente.');
        // Reseta o input de arquivo para que o usuário possa selecionar um arquivo diferente
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onProfileChange({ logoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

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
            {/* Indicador de status de salvamento */}
            <div className={`transition-opacity duration-500 self-center ${isSaved ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    <span>Salvo automaticamente</span>
                </p>
            </div>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="business-name" className="block text-sm font-medium mb-2">Nome da Empresa</label>
            <NeumorphicCardInset className="p-1 rounded-lg">
                <input
                  id="business-name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => onProfileChange({ name: e.target.value })}
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
                  value={profile.whatsappNumber}
                  onChange={(e) => onProfileChange({ whatsappNumber: e.target.value })}
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
                  value={profile.gbpLink}
                  onChange={(e) => onProfileChange({ gbpLink: e.target.value })}
                  placeholder="Cole o link aqui. Ex: https://maps.app.goo.gl/..."
                  className="w-full bg-transparent p-3 outline-none"
                />
            </NeumorphicCardInset>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 px-1">
              <strong>Dica:</strong> Para um link mais curto (Ex: maps.app.goo.gl/...), use a opção "Compartilhar" no perfil da sua empresa no Google Maps e cole o link aqui.
            </p>
          </div>
          <div>
              <label className="block text-sm font-medium mb-2">Logo da Empresa (Opcional)</label>
              {profile.logoUrl ? (
                  <div className="flex items-center gap-4">
                  <img src={profile.logoUrl} alt="Logo da empresa" className="w-16 h-16 object-contain rounded-md bg-white p-1 border border-slate-300 dark:border-slate-700" />
                  <button
                      onClick={() => onProfileChange({ logoUrl: null })}
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
        {onClose && (
            <div className="mt-6 pt-4 border-t border-slate-300 dark:border-slate-700 text-right">
                <button
                    onClick={onClose}
                    className="py-2 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
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

            <h3 className="font-bold text-lg">Como funciona?</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Nome da Empresa:</strong> Usado em todos os textos gerados para se referir ao seu negócio.</li>
                <li><strong>Nº de WhatsApp:</strong> Cria um link <code>wa.me</code> para que os clientes possam contatá-lo diretamente a partir dos posts.</li>
                <li><strong>Link do Perfil no Google:</strong> Adiciona uma chamada para ação "Ir Agora" para levar os clientes ao seu perfil no Google Maps.</li>
                <li><strong>Logo da Empresa:</strong> Adiciona sua marca visualmente nas imagens dos posts e personaliza a interface do aplicativo.</li>
            </ul>

            <h3 className="font-bold text-lg">Vantagens:</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Personalização Automática:</strong> Conteúdo gerado com a sua marca, sem esforço manual.</li>
                <li><strong>Consistência:</strong> Garante que todos os posts e respostas sigam o mesmo padrão de identidade.</li>
                <li><strong>Aumento da Conversão:</strong> Links corretos e branding consistente aumentam a confiança do cliente e facilitam o contato.</li>
            </ul>
        </div>
      </InfoModal>
    </>
  );
};

export default BusinessProfileSetup;