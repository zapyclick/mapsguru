// ===================================================================================
// ATENÇÃO: COLE SEU ACCESS TOKEN DO MERCADO PAGO AQUI
// 1. Vá para: https://www.mercadopago.com.br/developers/panel
// 2. Copie sua "Access Token" de Produção.
// 3. Cole o token na constante MERCADO_PAGO_ACCESS_TOKEN abaixo.
// ===================================================================================
const MERCADO_PAGO_ACCESS_TOKEN: string = 'TEST-763978306951987-091709-9751601d5222b41ff5fd2c3fcc5c79f9-572109952';

// ===================================================================================
// AVISO DE SEGURANÇA PARA PRODUÇÃO
// ===================================================================================
// Expor sua "Access Token" no código do frontend (cliente) é EXTREMAMENTE PERIGOSO.
// Qualquer pessoa pode inspecionar o código do seu site e roubar sua chave,
// ganhando controle total sobre sua conta do Mercado Pago.
//
// Para um aplicativo em produção, esta lógica DEVE ser movida para um backend seguro
// (como uma Cloud Function, um servidor Node.js, etc.).
//
// O fluxo correto é:
// 1. O seu frontend (este app) faz uma chamada para o SEU backend.
// 2. O seu backend, de forma segura, faz a chamada para a API do Mercado Pago
//    usando a Access Token que está armazenada de forma segura no servidor.
// 3. O seu backend retorna o link de pagamento (init_point) para o frontend.
// ===================================================================================


const API_BASE_URL = 'https://api.mercadopago.com';

/**
 * Cria uma preferência de pagamento no Mercado Pago.
 * @param planId - Um ID único para o item (ex: 'pro_monthly').
 * @param title - O título do plano (ex: 'Plano Pro Mensal').
 * @param unit_price - O preço do plano.
 * @param payer_email - O email do usuário que está comprando.
 * @returns Uma promessa que resolve para o objeto de preferência da API.
 * @throws Um erro se a configuração ou a chamada da API falhar.
 */
export const createSubscriptionPreference = async (
    planId: string, 
    title: string, 
    unit_price: number, 
    payer_email: string
): Promise<any> => {
    
    if (!MERCADO_PAGO_ACCESS_TOKEN || MERCADO_PAGO_ACCESS_TOKEN === 'COLE_SEU_ACCESS_TOKEN_AQUI') {
        throw new Error('O Access Token do Mercado Pago não está configurado. Cole o token em services/mercadoPagoService.ts.');
    }

    const appBaseUrl = window.location.origin;

    const preferenceData = {
        items: [
            {
                id: planId,
                title: title,
                quantity: 1,
                unit_price: unit_price,
                currency_id: 'BRL', // Moeda: Real Brasileiro
            },
        ],
        payer: {
            email: payer_email,
        },
        back_urls: {
            success: `${appBaseUrl}`, // URL de retorno para sucesso
            failure: `${appBaseUrl}`, // URL de retorno para falha
            pending: `${appBaseUrl}`, // URL de retorno para pendente
        },
        auto_return: 'approved', // Retorna automaticamente para o site após pagamento aprovado
        // A notification_url é crucial para um sistema de produção.
        // O Mercado Pago enviará uma notificação para esta URL (no seu backend)
        // sempre que o status do pagamento mudar. É assim que você deve
        // atualizar o plano do usuário no seu banco de dados (Firestore) de forma segura.
        // notification_url: "https://SEU_BACKEND.com/mercado-pago-webhook",
    };

    try {
        const response = await fetch(`${API_BASE_URL}/checkout/preferences`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
            },
            body: JSON.stringify(preferenceData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro da API Mercado Pago:", errorData);
            throw new Error(`Erro ao criar preferência de pagamento: ${errorData.message || response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Erro na chamada para o Mercado Pago:", error);
        // Re-lança o erro para que o componente que chamou a função possa tratá-lo.
        throw error;
    }
};