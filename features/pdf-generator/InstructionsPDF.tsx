
import React from 'react';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard.tsx';

const InstructionsPDF: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mt-8 break-inside-avoid">
      <h3 className="text-xl font-bold border-b-2 border-slate-300 dark:border-slate-600 pb-2 mb-4">{title}</h3>
      <div className="space-y-4 text-slate-700 dark:text-slate-300 print:text-gray-800">
        {children}
      </div>
    </section>
  );

  const CodeBlock: React.FC<{ children: React.ReactNode; lang?: string }> = ({ children, lang }) => (
    <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-sm print:bg-gray-100 print:text-black print:border print:border-gray-300 overflow-x-auto">
      <code className={lang ? `language-${lang}` : ''}>{children}</code>
    </pre>
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
            <h2 className="text-2xl font-bold print:text-3xl">Guia Rápido de Configuração das APIs</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 print:text-gray-600"><strong>Objetivo:</strong> Habilitar todas as funcionalidades de Inteligência Artificial do aplicativo configurando suas chaves de API.</p>

            <Section title="O que são as Chaves de API?">
              <p>
                Para que o aplicativo possa gerar textos com a IA do Google (Gemini) e buscar imagens profissionais (Unsplash), ele precisa de "chaves de acesso" ou "API Keys". Pense nelas como senhas que dão ao aplicativo permissão para usar esses serviços.
              </p>
              <p className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-sm">
                <strong>Importante:</strong> Suas chaves de API são secretas. Nunca as compartilhe publicamente ou as coloque diretamente no código.
              </p>
            </Section>

            <Section title="Passo a Passo para Configurar">
              <ol className="list-decimal list-inside space-y-3 pl-2">
                <li>
                  <strong>Encontre o Gerenciador de "Secrets":</strong>
                  <p className="mt-1">Neste ambiente de desenvolvimento, procure por um painel chamado <strong>"Secrets"</strong> ou <strong>"Environment Variables"</strong>. Ele geralmente é identificado por um ícone de chave <span className="material-symbols-outlined text-sm align-middle">key</span> ou cadeado <span className="material-symbols-outlined text-sm align-middle">lock</span>.</p>
                </li>
                <li>
                  <strong>Adicione as Duas Chaves Necessárias:</strong>
                  <p className="mt-1">Você precisará adicionar duas chaves (secrets). Use os nomes exatos abaixo para cada uma, substituindo o texto de exemplo pela sua chave real:</p>
                  
                  <h4 className="font-bold mt-3">1. Chave da API do Google Gemini</h4>
                  <p className="text-xs italic">Necessária para toda a geração de texto.</p>
                  <CodeBlock>{`API_KEY="SUA_CHAVE_DA_API_GEMINI"`}</CodeBlock>
                  <p className="mt-1">
                    Copie o nome <code>API_KEY</code> para o campo "Name" ou "Key" do secret, e sua chave pessoal do Google Gemini para o campo "Value".
                    Você pode obter sua chave em <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500">Google AI Studio</a>.
                  </p>

                  <h4 className="font-bold mt-3">2. Chave de Acesso do Unsplash</h4>
                  <p className="text-xs italic">Necessária para a busca de imagens online.</p>
                  <CodeBlock>{`UNSPLASH_ACCESS_KEY="SUA_CHAVE_DE_ACESSO_DO_UNSPLASH"`}</CodeBlock>
                  <p className="mt-1">
                    Copie 
                    <code>UNSPLASH_ACCESS_KEY</code> para o campo "Name" e sua "Access Key" do Unsplash para o campo "Value". Você pode criar um aplicativo e obter sua chave em 
                    <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="text-blue-500">Unsplash for Developers</a>.
                  </p>
                </li>
                <li>
                    <strong>Atualize o Aplicativo:</strong>
                    <p className="mt-1">Depois de salvar os "secrets", pode ser necessário atualizar a página ou reiniciar a aplicação para que as novas chaves sejam carregadas.</p>
                </li>
              </ol>
            </Section>
            
            <Section title="Verificação">
              <p>Se tudo estiver configurado corretamente, o aviso vermelho no topo do aplicativo desaparecerá e o botão "Buscar" na seção de imagens ficará habilitado. Agora você pode usar 100% do poder da IA para criar seus posts!</p>
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
