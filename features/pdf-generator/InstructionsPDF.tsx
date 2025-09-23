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

  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg text-sm print:bg-gray-100 print:text-black print:border print:border-gray-300 overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <>
      <div className="max-w-4xl mx-auto print-container">
        <NeumorphicCard className="p-6 sm:p-8 print:shadow-none print:p-0 print:bg-white dark:print:bg-white">
          
          <div className="flex justify-between items-center mb-8 print:hidden">
            <h1 className="text-2xl font-bold m-0">Instruções para Integração</h1>
            <button
              onClick={handlePrint}
              className="py-2 px-5 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors"
            >
              Imprimir ou Salvar como PDF
            </button>
          </div>
          
          <div id="printable-content" className="text-base">
            <h2 className="text-2xl font-bold print:text-3xl">Plano de Implementação: Integração de Pagamentos Mercado Pago no Firebase</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 print:text-gray-600"><strong>Objetivo:</strong> Adicionar um sistema de planos e pagamentos com liberação manual, garantindo a segurança e a estabilidade do aplicativo existente.</p>

            <Section title="Passo 1: Garantir a Segurança (Ação Mais Importante!)">
              <p><strong>Problema:</strong> A sua chave secreta (<code className="bg-slate-300 dark:bg-slate-700 p-1 rounded text-xs">MERCADO_PAGO_ACCESS_TOKEN</code>) está no frontend (<code className="bg-slate-300 dark:bg-slate-700 p-1 rounded text-xs">mercadoPagoService.ts</code>), o que é um risco de segurança grave.</p>
              <p><strong>Solução (Não negociável):</strong> Mover a lógica de criação de pagamento para uma <strong>Firebase Cloud Function</strong>.</p>
              <p><strong>Novo Fluxo Seguro:</strong></p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                  <li><strong>Frontend:</strong> Quando o usuário clica em "Fazer Upgrade", o app chama uma Cloud Function (ex: <code>createMercadoPagoPreference</code>), enviando o ID do plano e o ID do usuário.</li>
                  <li><strong>Backend (Cloud Function):</strong> A função, que tem a chave do Mercado Pago guardada de forma segura, recebe o pedido, chama a API do Mercado Pago para criar o link de pagamento.</li>
                  <li><strong>Backend (Cloud Function):</strong> A função também cria um registro na collection <code>payment_intentions</code> no Firestore com o status <code>pending</code>.</li>
                  <li><strong>Backend (Cloud Function):</strong> A função retorna <strong>apenas</strong> o link de pagamento (<code>init_point</code>) para o frontend.</li>
                  <li><strong>Frontend:</strong> O app redireciona o usuário para o link recebido.</li>
              </ol>
            </Section>

            <Section title="Passo 2: Criar o Controle de Acesso por Plano">
              <p>O controle deve existir em dois níveis: na interface (para a experiência do usuário) e no banco de dados (para segurança).</p>
              <h4 className="font-semibold pt-2">1. Controle na Interface (UI):</h4>
              <ul className="list-disc list-inside space-y-2 pl-2">
                  <li>Utilize o hook <code>useAuth</code> para obter os dados do usuário, que já incluem o <code>plan</code> e <code>subscriptionEndDate</code>.</li>
                  <li>"Bloqueie" as funcionalidades Pro na interface. Exemplo:</li>
              </ul>
              <CodeBlock>
{`// Dentro de um componente Premium
const { user } = useAuth();

if (user?.plan !== 'pro') {
  return <ComponenteDeUpgrade />;
}`}
              </CodeBlock>
              <h4 className="font-semibold pt-2">2. Controle no Backend (Firestore Security Rules):</h4>
              <ul className="list-disc list-inside space-y-2 pl-2">
                  <li><strong>Regra Essencial:</strong> Impedir que o usuário possa alterar o próprio plano diretamente no banco de dados.</li>
                  <li><strong>Exemplo de <code>firestore.rules</code>:</strong></li>
              </ul>
              <CodeBlock>
{`match /users/{userId} {
  // Permite que o usuário leia/escreva...
  allow read, write: if request.auth.uid == userId
    // ...EXCETO nos campos 'plan' e 'subscriptionEndDate'.
    && !('plan' in request.resource.data)
    && !('subscriptionEndDate' in request.resource.data);
}`}
              </CodeBlock>
            </Section>

            <Section title="Passo 3: Estruturar a Liberação Manual">
              <p>Este processo é ótimo para começar e validar a funcionalidade.</p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                  <li><strong>Recebimento do Pagamento:</strong> Você receberá uma notificação por e-mail do Mercado Pago quando um pagamento for aprovado.</li>
                  <li><strong>Identificação do Usuário:</strong> Use o e-mail do comprador para encontrá-lo na seção <strong>Authentication</strong> do seu Console do Firebase. Copie o <code>UID</code> dele.</li>
                  <li><strong>Liberação do Acesso:</strong> Vá para o <strong>Firestore Database</strong>, encontre o documento do usuário em <code>users/{'{UID}'}</code> e altere manualmente o campo <code>plan</code> para <code>"pro"</code> e defina o <code>subscriptionEndDate</code>.</li>
                  <li><strong>Registro (Recomendado):</strong> Vá para a collection <code>payment_intentions</code> e mude o <code>status</code> de <code>pending</code> para <code>completed</code>.</li>
              </ol>
            </Section>

            <Section title="Passo 4: Testar Antes de ir para Produção">
               <ul className="list-disc list-inside space-y-2 pl-2">
                  <li><strong>Sandbox do Mercado Pago:</strong> Use suas credenciais de teste (<code>TEST-...</code>) e cartões de crédito de teste para simular pagamentos.</li>
                  <li><strong>Firebase Emulator Suite:</strong> Use o emulador do Firebase para rodar Auth, Firestore e Cloud Functions localmente na sua máquina.</li>
                  <li><strong>Ambiente de Staging (Ideal):</strong> Crie um segundo projeto no Firebase para servir como ambiente de testes.</li>
              </ul>
            </Section>
            
            <Section title="Próximo Nível (Pós-lançamento): Automação com Webhooks">
              <p>Quando estiver pronto para escalar, substitua o processo manual.</p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                  <li><strong>O que é um Webhook?</strong> É uma notificação automática que o Mercado Pago envia para uma URL sua (uma segunda Cloud Function) sempre que um evento acontece.</li>
                  <li><strong>Fluxo Automatizado:</strong> Você cria uma Cloud Function (ex: <code>mercadoPagoWebhookHandler</code>) e configura a URL dela no seu painel do Mercado Pago. Quando um pagamento é aprovado, essa função recebe a notificação e atualiza o plano do usuário no Firestore automaticamente.</li>
              </ol>
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
