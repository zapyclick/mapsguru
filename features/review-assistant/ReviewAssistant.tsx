import React, { useState } from 'react';
import { BusinessProfile } from '../../types/index.ts';
import { generateReviewResponse } from '../../services/geminiService.ts';
import { NeumorphicCard, NeumorphicCardInset } from '../../components/ui/NeumorphicCard.tsx';
import { IconButton } from '../../components/ui/IconButton.tsx';
import InfoModal from '../../components/ui/InfoModal.tsx';

interface ReviewAssistantProps {
  businessProfile: BusinessProfile;
}

const ReviewAssistant: React.FC<ReviewAssistantProps> = ({ businessProfile }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [generatedResponse, setGeneratedResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success'>('idle');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleGenerateResponse = async () => {
    if (!reviewText) {
      alert('Por favor, cole a avaliação do cliente.');
      return;
    }
    if (rating === 0) {
      alert('Por favor, selecione a nota da avaliação.');
      return;
    }
    if (!businessProfile.name) {
      alert('Por favor, preencha o nome da empresa no Perfil do Negócio.');
      return;
    }

    setIsLoading(true);
    setGeneratedResponse('');
    const response = await generateReviewResponse(reviewText, rating, businessProfile);
    setGeneratedResponse(response);
    setIsLoading(false);
  };

  const handleCopy = async () => {
    if (!generatedResponse) return;
    try {
      await navigator.clipboard.writeText(generatedResponse);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Falha ao copiar o texto.');
    }
  };

  const StarRatingSelector: React.FC = () => (
    <div className="flex items-center justify-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => setRating(star)}
          aria-label={`Avaliação de ${star} estrela${star > 1 ? 's' : ''}`}
          className="p-2 rounded-full transition-colors duration-200"
        >
          <span
            className={`material-symbols-outlined text-4xl ${
              star <= rating ? 'text-amber-400' : 'text-slate-400 dark:text-slate-600'
            }`}
          >
            {star <= rating ? 'star' : 'star_border'}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <NeumorphicCard className="p-6 space-y-6">
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">Assistente de Respostas para Avaliações</h2>
            <IconButton onClick={() => setIsInfoModalOpen(true)} aria-label="Como funciona?" className="!w-8 !h-8">
                <span className="material-symbols-outlined text-base">help_outline</span>
            </IconButton>
        </div>

        {/* Input Section */}
        <div className="space-y-2">
          <label htmlFor="review-text" className="font-semibold block mb-2">
            1. Cole a avaliação do cliente
          </label>
          <NeumorphicCardInset className="p-1 rounded-lg">
            <textarea
              id="review-text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={5}
              placeholder="Ex: Ótimo atendimento e produtos de qualidade! Recomendo."
              className="w-full bg-transparent p-3 outline-none resize-y"
            />
          </NeumorphicCardInset>
        </div>

        <div className="space-y-2">
          <label className="font-semibold block mb-2 text-center">
            2. Selecione a nota da avaliação
          </label>
          <StarRatingSelector />
        </div>
        
        <div className="text-center">
          <button
            onClick={handleGenerateResponse}
            disabled={isLoading}
            className="w-full sm:w-auto py-3 px-8 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Gerando Resposta...' : 'Gerar Resposta'}
          </button>
        </div>

        {/* Output Section */}
        {(generatedResponse || isLoading) && (
          <div className="space-y-2 pt-6 border-t border-slate-300 dark:border-slate-700">
            <label htmlFor="generated-response" className="font-semibold block mb-2">
              3. Copie a resposta sugerida
            </label>
            <NeumorphicCardInset className="p-1 rounded-lg relative">
              <textarea
                id="generated-response"
                value={isLoading ? "Gerando..." : generatedResponse}
                readOnly
                rows={6}
                className="w-full bg-transparent p-3 outline-none resize-y"
              />
              {!isLoading && generatedResponse && (
                  <IconButton onClick={handleCopy} className="!w-10 !h-10 absolute top-2 right-2" aria-label="Copiar resposta">
                      <span className="material-symbols-outlined text-base">
                          {copyStatus === 'success' ? 'check' : 'content_copy'}
                      </span>
                  </IconButton>
              )}
            </NeumorphicCardInset>
          </div>
        )}
      </NeumorphicCard>
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Como Funciona o Assistente de Avaliações">
        <div className="space-y-3">
            <h3 className="font-bold text-lg">Por que é importante?</h3>
            <p>Responder às avaliações (tanto positivas quanto negativas) é um dos fatores mais fortes para construir confiança e melhorar o ranking local. Muitos donos de negócios não têm tempo ou não sabem como formular respostas profissionais, especialmente para críticas negativas.</p>

            <h3 className="font-bold text-lg">Como funciona?</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Cole a Avaliação:</strong> Copie a avaliação do cliente diretamente do seu GBP e cole no campo de texto.</li>
                <li><strong>Selecione a Nota:</strong> Indique qual foi a nota da avaliação (de 1 a 5 estrelas).</li>
                <li><strong>Gerar Resposta:</strong> Com um clique, a IA gera uma sugestão de resposta com o tom apropriado:
                    <ul className="list-disc list-inside ml-4 mt-1">
                        <li><strong>Para 4-5 estrelas:</strong> Uma resposta calorosa e agradecida.</li>
                        <li><strong>Para 1-3 estrelas:</strong> Uma resposta profissional e empática, buscando resolver o problema.</li>
                    </ul>
                </li>
            </ul>

            <h3 className="font-bold text-lg">Vantagens:</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Economia de Tempo:</strong> Crie respostas rápidas e bem formuladas.</li>
                <li><strong>Gestão de Reputação:</strong> Transforme críticas em oportunidades de mostrar um excelente atendimento.</li>
                <li><strong>SEO Local:</strong> O Google valoriza a interação do proprietário com os clientes, o que pode melhorar seu ranking.</li>
            </ul>
        </div>
      </InfoModal>
    </>
  );
};

export default ReviewAssistant;
