import React from 'react';
import { NeumorphicCard } from '../../components/ui/NeumorphicCard.tsx';

const InstructionsPDF: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="mt-6 break-inside-avoid">
      <h3 className="text-xl font-bold border-b border-slate-300 dark:border-slate-600 pb-2 mb-3">{title}</h3>
      <div className="space-y-3 text-slate-700 dark:text-slate-300 print:text-gray-800">
        {children}
      </div>
    </section>
  );

  const CodeBlock: React.FC<{ children: React.ReactNode; lang?: string }> = ({ children, lang }) => (
    <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-sm print:bg-gray-100 print:text-black print:border print:border-gray-300 overflow-x-auto">
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
            <h2 className="text-2xl font-bold print:text-3xl">Guia de Configuração (Versão Frontend-Only)</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 print:text-gray-600"><strong>Objetivo:</strong> Configurar as chaves de API necessárias para que as funcionalidades de IA e busca de imagens funcionem corretamente.</p>

            <Section title="Parte 1: Configurando as Chaves de API">
              <p>Para que o aplicativo funcione, você precisa fornecer duas chaves de API: uma para a IA do Google (Gemini) e outra para o banco de imagens (Unsplash).</p>
              
              <h4 className="font-bold mt-4">1. Chave da API Gemini (Google AI)</h4>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li><strong>Obtenha a Chave:</strong> Acesse o Google AI Studio em <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">aistudio.google.com/app/apikey</a>.</li>
                <li><strong>Crie uma Nova Chave:</strong> Clique em "Create API key in new project" e copie a chave gerada.</li>
                <li>
                  <strong>Adicione ao Código:</strong> Abra o arquivo `services/geminiService.ts` no seu editor de código e cole a chave que você copiou, substituindo o texto de exemplo.
                  <CodeBlock lang="typescript">{`// services/geminiService.ts

// ...
const GEMINI_API_KEY = "COLE_AQUI_SUA_CHAVE_DA_API_GEMINI";
// ...`}</CodeBlock>
                </li>
              </ol>

              <h4 className="font-bold mt-4">2. Chave de Acesso do Unsplash (Opcional)</h4>
               <p>Esta chave é necessária para a funcionalidade de busca de imagens online.</p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li><strong>Crie uma Conta:</strong> Acesse <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">unsplash.com/developers</a> e crie uma conta de desenvolvedor.</li>
                <li><strong>Crie um Novo Aplicativo:</strong> Siga as instruções para criar um novo aplicativo. Você receberá uma "Access Key".</li>
                <li>
                  <strong>Adicione ao Código:</strong> Abra o arquivo `services/unsplashService.ts` e cole sua "Access Key".
                  <CodeBlock lang="typescript">{`// services/unsplashService.ts

// ...
const UNSPLASH_ACCESS_KEY: string = 'COLE_AQUI_SUA_ACCESS_KEY_DO_UNSPLASH';
// ...`}</CodeBlock>
                </li>
              </ol>
            </Section>

            <Section title="Parte 2: Como Funciona o Armazenamento de Dados">
                <p>Nesta versão do aplicativo, todos os seus dados são armazenados localmente no seu navegador, usando uma tecnologia chamada <strong>LocalStorage</strong>.</p>
                 <ul className="list-disc list-inside space-y-2 pl-2">
                    <li>
                        <strong>Privacidade Total:</strong> Seu "Perfil do Negócio" e outras informações nunca saem do seu computador.
                    </li>
                     <li>
                        <strong>Persistência Automática:</strong> Tudo o que você digita é salvo automaticamente. Se você fechar e abrir o navegador, seus dados ainda estarão lá.
                    </li>
                     <li>
                        <strong>Aviso Importante:</strong> Como os dados são salvos por navegador, eles <strong>não serão sincronizados</strong> entre diferentes computadores ou navegadores (por exemplo, entre o Chrome e o Firefox).
                    </li>
                    <li>
                        <strong>Cuidado ao Limpar Dados:</strong> Se você limpar o cache ou os dados de navegação do seu navegador, <strong>todos os dados salvos neste aplicativo serão perdidos permanentemente</strong>.
                    </li>
                 </ul>
            </Section>
            
            <Section title="Parte 3: Funcionalidades">
                <p>Com a remoção dos sistemas de login e pagamento, todas as ferramentas de IA estão disponíveis de forma ilimitada.</p>
                 <ul className="list-disc list-inside space-y-2 pl-2">
                     <li><strong>Gerador de Posts:</strong> Crie textos e imagens para seus posts no Google Business Profile.</li>
                     <li><strong>Assistente de Avaliações:</strong> Gere respostas profissionais para avaliações de clientes.</li>
                     <li><strong>Gerador de Q&A:</strong> Crie conteúdo para a seção de Perguntas e Respostas do seu perfil.</li>
                     <li><strong>Catálogo de Produtos:</strong> Elabore descrições persuasivas para seus produtos e serviços.</li>
                 </ul>
                 <p className="mt-4">Explore as ferramentas e comece a criar conteúdo de alta qualidade para o seu negócio local!</p>
            </Section>
          </div>
        </NeumorphicCard>
      </div>
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
          }
          .print-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
          }
          main {
            padding: 2rem !important;
          }
        }
        @page {
          size: A4;
          margin: 2cm;
        }
      `}</style>
    </>
  );
};

export default InstructionsPDF;