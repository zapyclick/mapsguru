import React, { useState } from 'react';
import { BusinessProfile } from '../types.ts';
import { generateQnaResponse } from '../services/geminiService.ts';
import { NeumorphicCard, NeumorphicCardInset } from './NeumorphicCard.tsx';
import { IconButton } from './IconButton.tsx';
import InfoModal from './InfoModal.tsx';

interface QnaAssistantProps {
  businessProfile: BusinessProfile;
}

const QnaAssistant: React.FC<QnaAssistantProps> = ({ businessProfile }) => {
  const [question, setQuestion] = useState('');
  const [generatedAnswer, setGeneratedAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success'>('idle');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const handleGenerateAnswer = async () => {
    if (!question) {
      alert('Por favor, insira uma pergunta.');
      return;
    }
    if (!businessProfile.name) {
      alert('Por favor, preencha o nome da empresa no Perfil do Negócio.');
      return;
    }

    setIsLoading(true);
    setGeneratedAnswer('');
    const response = await generateQnaResponse(question, businessProfile);
    setGeneratedAnswer(response);
    setIsLoading(false);
  };

  const handleCopy = async () => {
    if (!generatedAnswer) return;
    try {
      await navigator.clipboard.writeText(generatedAnswer);
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
            <h2 className="text-2xl font-bold">Gerador de Conteúdo para Perguntas e Respostas</h2>
            <IconButton onClick={() => setIsInfoModalOpen(true)} aria-label="Como funciona?" className="!w-8 !h-8">
                <span className="material-symbols-outlined text-base">help_outline</span>
            </IconButton>
        </div>


        {/* Input Section */}
        <div className="space-y-2">
          <label htmlFor="qna-question" className="font-semibold block mb-2">
            1. Insira uma pergunta comum
          </label>
          <NeumorphicCardInset className="p-1 rounded-lg">
            <textarea
              id="qna-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="Ex: Vocês aceitam animais de estimação?"
              className="w-full bg-transparent p-3 outline-none resize-y"
            />
          </NeumorphicCardInset>
        </div>
        
        <div className="text-center">
          <button
            onClick={handleGenerateAnswer}
            disabled={isLoading}
            className="w-full sm:w-auto py-3 px-8 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Gerando Resposta...' : 'Gerar Resposta'}
          </button>
        </div>

        {/* Output Section */}
        {(generatedAnswer || isLoading) && (
          <div className="space-y-2 pt-6 border-t border-slate-300 dark:border-slate-700">
            <label htmlFor="generated-answer" className="font-semibold block mb-2">
              2. Copie a resposta sugerida
            </label>
            <NeumorphicCardInset className="p-1 rounded-lg relative">
              <textarea
                id="generated-answer"
                value={isLoading ? "Gerando..." : generatedAnswer}
                readOnly
                rows={6}
                className="w-full bg-transparent p-3 outline-none resize-y"
              />
              {!isLoading && generatedAnswer && (
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
      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Como Funciona o Gerador de Q&A">
        <div className="space-y-3">
            <h3 className="font-bold text-lg">Por que é importante?</h3>
            <p>A seção de Perguntas e Respostas (Q&A) do seu perfil é uma ferramenta poderosa para educar clientes e melhorar seu SEO. Ao responder proativamente às dúvidas comuns, você demonstra autoridade, economiza o tempo dos seus clientes e do seu time.</p>

            <h3 className="font-bold text-lg">Como funciona?</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Insira uma Pergunta:</strong> Digite uma pergunta que seus clientes frequentemente fazem (Ex: "Qual o horário de funcionamento nos feriados?").</li>
                <li><strong>Gere uma Resposta:</strong> A IA criará uma resposta completa e otimizada, agindo como se fosse o proprietário do negócio.</li>
                <li><strong>Copie e Publique:</strong> Copie a resposta gerada e cole na seção de Q&A do seu Perfil da Empresa no Google. Lembre-se que você mesmo pode postar tanto a pergunta quanto a resposta!</li>
            </ul>

            <h3 className="font-bold text-lg">Vantagens:</h3>
            <ul className="list-disc list-inside space-y-2">
                <li><strong>Proatividade:</strong> Antecipe as dúvidas dos clientes antes mesmo que eles perguntem.</li>
                <li><strong>Redução de Contatos:</strong> Filtre as dúvidas básicas que chegam por telefone ou WhatsApp.</li>
                <li><strong>Melhora o SEO Local:</strong> As perguntas e respostas frequentemente contêm palavras-chave que ajudam seu negócio a ser encontrado.</li>
            </ul>
        </div>
      </InfoModal>
    </>
  );
};

export default QnaAssistant;