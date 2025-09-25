import React from 'react';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard.tsx';
import { isGeminiConfigured } from '../../services/geminiService.ts';
import { isUnsplashConfigured } from '../../services/unsplashService.ts';

const InstructionsPDF: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const geminiStatus = isGeminiConfigured();
  const unsplashStatus = isUnsplashConfigured();

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mt-8 break-inside-avoid">
      <h3 className="text-xl font-bold border-b-2 border-slate-300 dark:border-slate-600 pb-2 mb-4">{title}</h3>
      <div className="space-y-4 text-slate-700 dark:text-slate-300 print:text-gray-800">
        {children}
      </div>
    </section>
  );

  return (
    <>
      <div className="max-w-4xl mx-auto print-container">
        <NeumorphicCard className="p-6 sm:p-8 print:shadow-none print:p-0 print:bg-white dark:print:bg-white">
          
          <div className="flex justify-between items-center mb-8 print:hidden">
            <h1 className="text-2xl font-bold m-0">Instruções de Configuração</h1>
            <button
              onClick={handlePrint}
              className="py-2 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
            >
              Imprimir ou Salvar como PDF
            </button>
          </div>
          
          <div id="printable-content" className="text-base">
            <h2 className="text-2xl font-bold print:text-3xl">Instruções para o Ambiente do AI Studio</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 print:text-gray-600">Para que o aplicativo funcione, você precisa adicionar suas chaves de API de forma segura usando o painel "Secrets".</p>

            <Section title="Verificação de Status">
              <p>Use esta seção para verificar se suas chaves foram carregadas corretamente pelo aplicativo.</p>
              <div className="space-y-3">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <span className={`material-symbols-outlined text-2xl ${geminiStatus ? 'text-green-500' : 'text-red-500'}`}>
                    {geminiStatus ? 'check_circle' : 'cancel'}
                  </span>
                  <div>
                    <p className="font-bold">API do Google Gemini</p>
                    <p className="text-sm">{geminiStatus ? 'Configurada corretamente!' : 'Não configurada. Adicione um "Secret" com o nome API_KEY.'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <span className={`material-symbols-outlined text-2xl ${unsplashStatus ? 'text-green-500' : 'text-red-500'}`}>
                    {unsplashStatus ? 'check_circle' : 'cancel'}
                  </span>
                  <div>
                    <p className="font-bold">API do Unsplash</p>
                    <p className="text-sm">{unsplashStatus ? 'Configurada corretamente!' : 'Não configurada. Adicione um "Secret" com o nome VITE_UNSPLASH_ACCESS_KEY.'}</p>
                  </div>
                </div>
              </div>
            </Section>

            <Section title="Passo a Passo (Configuração Correta)">
              <ol className="list-decimal list-inside space-y-4 pl-2">
                <li>
                  <strong>Abra o painel "Secrets"</strong>
                  <p className="mt-1">Na barra de ferramentas à esquerda, clique no ícone de <strong>chave (🔑)</strong> para abrir o painel de "Secrets".</p>
                </li>
                <li>
                  <strong>Adicione a Chave do Google Gemini</strong>
                  <p className="mt-1">Clique em "Add new secret" e preencha os campos:</p>
                  <ul className="list-disc list-inside ml-6 mt-2">
                      <li><strong>Name:</strong> <code className="bg-slate-200 dark:bg-slate-700 p-1 rounded">API_KEY</code></li>
                      <li><strong>Value:</strong> Cole sua chave da API do Gemini aqui (sem aspas).</li>
                  </ul>
                </li>
                 <li>
                    <strong>Adicione a Chave do Unsplash</strong>
                    <p className="mt-1">Clique em "Add new secret" novamente e preencha:</p>
                     <ul className="list-disc list-inside ml-6 mt-2">
                        <li><strong>Name:</strong> <code className="bg-slate-200 dark:bg-slate-700 p-1 rounded">VITE_UNSPLASH_ACCESS_KEY</code></li>
                        <li><strong>Value:</strong> Cole sua chave de acesso do Unsplash aqui (sem aspas).</li>
                    </ul>
                    <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">O prefixo `VITE_` é uma convenção necessária neste ambiente para chaves personalizadas.</p>
                </li>
                <li>
                    <strong>Atualize o Aplicativo:</strong>
                    <p className="mt-1">Após salvar as chaves, atualize a página da aplicação. A seção "Verificação de Status" acima deve mostrar os dois itens como configurados, e todas as funcionalidades estarão habilitadas.</p>
                </li>
              </ol>
            </Section>
            
          </div>
        </NeumorphicCard>
      </div>
      <style>{`
        @media print {
          body { background-color: #ffffff !important; }
          .print-container { width: 100%; max-width: 100%; margin: 0; padding: 0; }
          main { padding: 2rem !important; }
        }
        @page { size: A4; margin: 2cm; }
      `}</style>
    </>
  );
};

export default InstructionsPDF;