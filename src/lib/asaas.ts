export interface AsaasCustomer {
    name: string;
    email: string;
    cpfCnpj?: string;
}

export interface AsaasSubscription {
    customer: string;
    billingType: 'PIX' | 'BOLETO' | 'CREDIT_CARD' | 'UNDEFINED';
    value: number;
    nextDueDate: string;
    cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'ANNUALLY';
}

export class AsaasService {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.ASAAS_API_KEY || '';
        this.baseUrl = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';

        if (!this.apiKey) {
            console.warn('[Asaas] ASAAS_API_KEY não encontrada!');
        }
    }

    public async request(endpoint: string, options: RequestInit = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'access_token': this.apiKey,
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...headers,
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Asaas API Error:', data);
            throw new Error(data.errors?.[0]?.description || 'Erro na API do Asaas');
        }

        return data; // Retorna o corpo da resposta (contendo .data, .object, etc)
    }

    // Buscar ou criar cliente
    async getOrCreateCustomer(email: string, name: string, cpfCnpj?: string, phone?: string): Promise<string> {
        // Tentar buscar por email
        const customers = await this.request(`/customers?email=${encodeURIComponent(email)}`);
        if (customers.data && customers.data.length > 0) {
            // Poderíamos atualizar o cliente aqui se tivermos CPF/Phone novos, 
            // mas por simplicidade vamos assumir que o ID basta.
            // Opcional: Se quiser garantir update:
            if (cpfCnpj || phone) {
                try {
                    await this.request(`/customers/${customers.data[0].id}`, {
                        method: 'POST', // Testando POST primeiro, muitos gateways usam POST para update parcial.
                        body: JSON.stringify({ cpfCnpj, phone, mobilePhone: phone })
                    });
                } catch (e) {
                    console.warn('Erro ao atualizar cliente Asaas:', e);
                    // Ignora erro de update e tenta prosseguir
                }
            }
            return customers.data[0].id;
        }

        // Criar novo
        const newCustomer = await this.request('/customers', {
            method: 'POST',
            body: JSON.stringify({
                name,
                email,
                cpfCnpj,
                phone,
                mobilePhone: phone // Asaas as vezes pede mobilePhone
            }),
        });
        return newCustomer.id;
    }

    // Criar assinatura (recorrência)
    async createSubscription(data: AsaasSubscription) {
        return this.request('/subscriptions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Cancelar/Remover assinatura
    async deleteSubscription(subscriptionId: string) {
        return this.request(`/subscriptions/${subscriptionId}`, {
            method: 'DELETE'
        });
    }

    // Criar uma cobrança única (Checkout)
    async createPayment(data: any) {
        return this.request('/payments', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Listar cobranças de uma assinatura
    async getSubscriptionPayments(subscriptionId: string) {
        const res = await this.request(`/payments?subscription=${subscriptionId}`);
        return res; // Retorna o objeto completo da resposta (com .data)
    }
}

export const asaas = new AsaasService();
