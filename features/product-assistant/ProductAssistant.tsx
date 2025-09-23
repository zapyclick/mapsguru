import React, { useState } from 'react';
import { BusinessProfile } from '../../types/index.ts';
import { generateProductDescription } from '../../services/geminiService.ts';
import { NeumorphicCard, NeumorphicCardInset } from '../../components/ui/NeumorphicCard.tsx';
import { IconButton } from '../../components/ui/IconButton.tsx';
import InfoModal from '../../components/ui/InfoModal.tsx';

interface ProductAssistantProps {
  businessProfile: BusinessProfile;
}

const ProductAssistant: React.FC<ProductAssistantProps> = ({ businessProfile }) => {
  const [productName, setProductName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success'>('idle');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleGenerateDescription = async () => {
    if (!productName) {
      alert('Por favor, insira o nome do produto ou serviço.');
      return;
    }
     if (!keywords) {
      alert('Por favor, insira algumas características ou palavras-chave.');
      return;
    }
    if (!businessProfile.name) {
      alert('Por favor, preencha o nome da empresa no Perfil do Negócio.');
      return;
    }

    setIsLoading(true);
    setGeneratedDescription('');
    const response = await generateProductDescription(productName, keywords, businessProfile);
    setGeneratedDescription(response);
    setIsLoading(false);
  };

  const handleCopy = async () => {
    if (!generatedDescription) return;
    try {
      await navigator.clipboard.writeText(generatedDescription);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Falha ao copiar o texto.');
    }
  };

  return (
    <>
      <NeumorphicCard className="p-6 space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Criador de Descrições para Produtos e Serviços</h2>
            <IconButton onClick={() => setIsInfoModalOpen(true)} aria-label="Como funciona?" className="!w-8 !h-8">
                <span className="material-symbols-outlined text-base">help_outline</span>
            </IconButton>
        </div>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
              <label htmlFor="product-name" className="font-semibold block mb-2">
              1. Nome do Produto ou Serviço
              </label>
              <NeumorphicCardInset className="p-1 rounded-lg">
              <input
                  id="product-name"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ex: Macarrão à Bolonhesa"
                  className="w-full bg-transparent p-3 outline-none"
              />
              </NeumorphicCardInset>
          </div>
          <div>
              <label htmlFor="product-keywords" className="font-semibold block mb-2">
              2. Principais Características ou Palavras-chave
              </label>
              <NeumorphicCardInset className="p-1 rounded-lg">
              <textarea
                  id="product-keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  rows={3}
                  placeholder="Ex: receita tradicional, molho artesanal, carne de primeira"
                  className="w-full bg-transparent p-3 outline-none resize-y"
              />
              </NeumorphicCardInset>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={handleGenerateDescription}
            disabled={isLoading}
            className="w-full sm:w-auto py-3 px-8 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Gerando Descrição...' : 'Gerar Descrição'}
          </button>
        </div>

        {/* Output Section */}
        {(generatedDescription || isLoading) && (
          <div className="space-y-2 pt-6 border-t border-slate-300 dark:border-slate-700">
            <label htmlFor="generated-description" className="font-semibold block mb-2">
              3. Copie a descrição sugerida
            </label>
            <NeumorphicCardInset className="p-1 rounded-lg relative">
              <textarea
                id="generated-description"
                value={isLoading ? "Gerando..." : generatedDescription}
                readOnly
                rows={5}
                className="w-full bg-transparent p-3 outline-none resize-y"
              />
              {!isLoading && generatedDescription && (
                  <IconButton onClick={handleCopy} className="!w-10 !h-10 absolute top-2 right-2" aria-label="Copiar descrição">
                      <span className="material-symbols-outlined text-base">
                          {copyStatus === 'success' ? 'check' : 'content_copy'}
                      </span>
                  </IconButton>
              )}
            </NeumorphicCardInset>
          </div>
        )}
      </NeumorphicCard>
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Como Funciona o Criador de Descrições">
        <div className="space-y-3">
            <h3 className="font-bold text-lg">Por que é importante?</h3>
            <p>As seções "Produtos" e "Serviços" do seu perfil são sua vitrine digital. Descrições bem-feitas, que focam nos benefícios para o cliente, podem ser o fator decisivo para que ele escolha o seu negócio em vez de um concorrente.</p>

            <h3 className="font-bold text-lg">Como funciona?</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Insira o Nome:</strong> Digite o nome do produto ou serviço que deseja descrever.</li>
                <li><strong>Liste as Características:</strong> Adicione palavras-chave ou características principais que definem o item.</li>
                <li><strong>Gere a Descrição:</strong> A IA transformará os pontos-chave em uma descrição curta, vendedora e focada nos benefícios, pronta para ser copiada.</li>
            </ul>

            <h3 className="font-bold text-lg">Vantagens:</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Aumenta a Conversão:</strong> Transforme uma simples lista de itens em um catálogo de vendas atraente.</li>
                <li><strong>Destaca seus Diferenciais:</strong> Comunique o valor e a qualidade do que você oferece de forma clara e profissional.</li>
                <li><strong>Completa seu Perfil:</strong> Perfis com todas as seções bem preenchidas são mais valorizados pelo Google e transmitem mais confiança aos clientes.</li>
            </ul>
        </div>
      </InfoModal>
    </>
  );
};

export default ProductAssistant;
