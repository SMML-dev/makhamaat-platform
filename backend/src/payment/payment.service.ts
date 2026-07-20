import { Injectable } from '@nestjs/common';
import { FedaPay, Transaction } from 'fedapay';

export interface PaymentSession {
  id: string;
  url: string;
  amount: number;
  currency: string;
}

@Injectable()
export class PaymentService {
  private readonly mode = process.env.PAYMENT_MODE || 'SIMULATOR';
  private readonly frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  private readonly fedapayApiKey = process.env.FEDAPAY_API_KEY;
  private readonly fedapayPublicKey = process.env.FEDAPAY_PUBLIC_KEY;
  private readonly fedapayMode = process.env.FEDAPAY_MODE || 'test';

  constructor() {
    if (this.mode === 'FEDAPAY' && this.fedapayApiKey) {
      FedaPay.setApiKey(this.fedapayApiKey);
      FedaPay.setEnvironment(this.fedapayMode === 'live' ? 'live' : 'sandbox');
    }
  }

  async createSession(
    amount: number,
    currency: string,
    orderId: string,
    returnUrl?: string,
    backendBaseUrl?: string,
    customer?: { name: string; email: string; phone: string }
  ): Promise<PaymentSession> {
    const frontendBase = returnUrl || this.frontendUrl;

    if (this.mode === 'SIMULATOR') {
      const sessionId = `sim_${Math.random().toString(36).substr(2, 9)}`;
      const url = `${frontendBase}/payment-simulator?session_id=${sessionId}&order_id=${orderId}&amount=${amount}&currency=${currency}`;

      return {
        id: sessionId,
        url,
        amount,
        currency,
      };
    }

    if (this.mode === 'FEDAPAY') {
      try {
        const names = customer?.name ? customer.name.split(' ') : ['Client', 'Makhamaat'];
        const firstname = names[0];
        const lastname = names.slice(1).join(' ') || 'Makhamaat';

        const callbackUrl = `${backendBaseUrl || 'http://localhost:3005'}/payment/verify?order_ids=${orderId}&return_url=${frontendBase}`;

        const transactionData: any = {
          description: `Paiement commande ${orderId}`,
          amount: amount,
          currency: {
            iso: currency,
          },
          callback_url: callbackUrl,
        };

        if (customer?.email) {
          transactionData.customer = {
            firstname: firstname,
            lastname: lastname,
            email: customer.email,
          };
          if (customer.phone) {
            const digits = customer.phone.replace(/\D/g, '');
            if (digits) {
              transactionData.customer.phone_number = {
                number: digits,
                country: 'SN',
              };
            }
          }
        }

        const transaction = await Transaction.create(transactionData);
        const tokenObject = await transaction.generateToken();

        return {
          id: transaction.id.toString(),
          url: tokenObject.url,
          amount,
          currency,
        };
      } catch (error) {
        console.error('FedaPay transaction creation error:', error);
        throw new Error('Failed to create FedaPay transaction');
      }
    }

    throw new Error('Payment provider not configured');
  }

  async verifyPayment(sessionId: string): Promise<boolean> {
    if (this.mode === 'SIMULATOR') {
      return true;
    }

    if (this.mode === 'FEDAPAY') {
      try {
        const transaction = await Transaction.retrieve(sessionId);
        return transaction.status === 'approved';
      } catch (error) {
        console.error('FedaPay verification error:', error);
        return false;
      }
    }

    return false;
  }
}
