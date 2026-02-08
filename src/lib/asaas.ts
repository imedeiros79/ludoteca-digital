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

class AsaasService {
    private apiKey: string;
    private baseUrl: string;

    constructor() {
        this.apiKey = process.env.ASAAS_API_KEY || '';
        this.baseUrl = process.env.ASAAS_API_URL || 'https://www.asaas.com/api/v3';
    }

    private async request(endpoint: string, options: RequestInit = {}) {
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

        return data;
    }

    // Buscar ou criar cliente
    async getOrCreateCustomer(email: string, name: string): Promise<string> {
        // Tentar buscar por email
        const customers = await this.request(`/customers?email=${email}`);
        if (customers.data && customers.data.length > 0) {
            return customers.data[0].id;
        }

        // Criar novo
        const newCustomer = await this.request('/customers', {
            method: 'POST',
            body: JSON.stringify({ name, email }),
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

    // Criar uma cobrança única (Checkout)
    async createPayment(data: any) {
        return this.request('/payments', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

export const asaas = new AsaasService();
