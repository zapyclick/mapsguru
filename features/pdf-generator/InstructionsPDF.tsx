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
            <h1 className="text-2xl font-bold m-0">Instruções de Publicação</h1>
            <button
              onClick={handlePrint}
              className="py-2 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
            >
              Imprimir ou Salvar como PDF
            </button>
          </div>
          
          <div id="printable-content" className="text-base">
            <h2 className="text-2xl font-bold print:text-3xl">Guia de Deploy Profissional</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 print:text-gray-600"><strong>Objetivo:</strong> Publicar este aplicativo na internet usando um fluxo de trabalho moderno e seguro.</p>

            <Section title="Pré-requisitos">
              <p>Antes de começar, você precisará das seguintes ferramentas e contas:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong>Node.js e npm:</strong> Essencial para rodar o projeto. Baixe em <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-blue-500">nodejs.org</a>.</li>
                <li><strong>Git:</strong> O sistema de versionamento de código. Baixe em <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500">git-scm.com</a>.</li>
                <li><strong>Conta no GitHub:</strong> Onde seu código ficará armazenado. Crie em <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-blue-500">github.com</a>.</li>
                <li><strong>Conta na Netlify:</strong> A plataforma de hospedagem gratuita que usaremos. Crie em <a href="https://netlify.com" target="_blank" rel="noopener noreferrer" className="text-blue-500">netlify.com</a>.</li>
              </ul>
            </Section>

            <Section title="Passo 1: Preparar o Código Localmente">
              <ol className="list-decimal list-inside space-y-3 pl-2">
                <li><strong>Baixe o código:</strong> Use o botão de download para baixar os arquivos do projeto como um `.zip`.</li>
                <li><strong>Extraia e abra no terminal:</strong> Extraia o conteúdo para uma pasta no seu computador. Abra seu terminal (Prompt de Comando, PowerShell ou Terminal do Mac) e navegue até essa pasta.</li>
                <li><strong>Instale as dependências:</strong> No terminal, execute o comando abaixo. Isso instalará todos os pacotes necessários para o projeto funcionar.
                  <CodeBlock>npm install</CodeBlock>
                </li>
                <li>
                  <strong>Crie o arquivo de ambiente:</strong> Crie um arquivo chamado `.env.local` na raiz do projeto e adicione o seguinte conteúdo. É aqui que você colocará suas chaves para testar o app no seu computador.
                   <CodeBlock>{`# Arquivo: .env.local\n\nVITE_GEMINI_API_KEY="SUA_CHAVE_DA_API_GEMINI"\nVITE_UNSPLASH_ACCESS_KEY="COLE_AQUI_SUA_ACCESS_KEY_DO_UNSPLASH"`}</CodeBlock>
                   <p className="text-xs italic mt-2"><strong>Importante:</strong> Substitua os valores pelos placeholders com suas chaves reais para desenvolvimento local. O arquivo `.env.local` <strong>NÃO</strong> é enviado para o GitHub, mantendo suas chaves seguras.</p>
                </li>
                 <li><strong>Teste localmente (opcional):</strong> Rode o comando `npm run dev` para ver o aplicativo funcionando no seu computador.</li>
              </ol>
            </Section>

            <Section title="Passo 2: Enviar o Código para o GitHub">
              <ol className="list-decimal list-inside space-y-3 pl-2">
                <li><strong>Inicialize o Git:</strong> No terminal, dentro da pasta do projeto, execute:
                   <CodeBlock>git init -b main</CodeBlock>
                </li>
                <li><strong>Adicione e salve os arquivos:</strong>
                  <CodeBlock>{`git add .\ngit commit -m "Commit inicial do projeto"`}</CodeBlock>
                </li>
                <li><strong>Crie um repositório no GitHub:</strong> No site do GitHub, crie um novo repositório (pode ser privado).</li>
                <li><strong>Conecte e envie o código:</strong> O GitHub fornecerá alguns comandos. Copie e cole no seu terminal os comandos para "push an existing repository from the command line". Eles serão parecidos com:
                  <CodeBlock>{`git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git\ngit push -u origin main`}</CodeBlock>
                </li>
              </ol>
            </Section>

             <Section title="Passo 3: Publicar na Netlify">
              <ol className="list-decimal list-inside space-y-3 pl-2">
                <li><strong>Faça login na Netlify</strong> e clique em "Add new site" &gt; "Import an existing project".</li>
                <li><strong>Conecte com o GitHub</strong> e autorize o acesso.</li>
                <li><strong>Selecione o repositório</strong> que você acabou de criar.</li>
                <li><strong>Configure o Build:</strong> A Netlify geralmente detecta as configurações, mas confirme que estão assim:
                    <ul className="list-disc list-inside ml-4 my-2">
                      <li><strong>Build command:</strong> `npm run build`</li>
                      <li><strong>Publish directory:</strong> `dist`</li>
                    </ul>
                </li>
                 <li><strong>Adicione as Chaves de API:</strong> Esta é a parte mais importante para a segurança.
                    <ul className="list-disc list-inside ml-4 my-2">
                      <li>Clique em "Show advanced" e depois em "New variable".</li>
                      <li>Crie uma variável com a Chave `VITE_GEMINI_API_KEY` e cole o Valor da sua chave Gemini.</li>
                      <li>Crie outra variável com a Chave `VITE_UNSPLASH_ACCESS_KEY` e cole o Valor da sua chave Unsplash.</li>
                    </ul>
                     <p className="text-xs italic mt-2">Isto injeta suas chaves de forma segura durante o processo de build, sem expô-las no código.</p>
                </li>
                <li><strong>Clique em "Deploy site".</strong> Aguarde alguns minutos. A Netlify irá construir e publicar seu aplicativo em um link público!</li>
              </ol>
            </Section>

            <Section title="Seu Fluxo de Trabalho Profissional">
              <p>Parabéns! Seu site está no ar. A partir de agora, seu fluxo de trabalho é simples:</p>
              <ol className="list-decimal list-inside space-y-3 pl-2">
                <li>Faça alterações no código no seu computador.</li>
                <li>Salve as alterações com o Git (`git add .`, `git commit -m "minha nova alteração"`).</li>
                <li>Envie para o GitHub com o comando:
                  <CodeBlock>git push</CodeBlock>
                </li>
                <li>A Netlify detectará a mudança automaticamente e publicará a nova versão do seu site em segundos.</li>
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