import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  displayInvoiceDetail
} from '../../src/logic/it-1784969823049-2-1-2';

interface PaymentGatewayAdapter {
  generatePaymentLink: (invoiceId: string, amount: number) => Promise<{ paymentUrl: string; qrCode: string }>;
  verifyPayment: (transactionId: string) => Promise<boolean>;
  getTransactionStatus: (transactionId: string) => Promise<{ status: string }>;
}

interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  customerEmail: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolder: string;
}

interface InvoiceDisplayResult {
  invoice: Invoice;
  paymentMethod: {
    type: 'bank_transfer' | 'online_payment';
    bankInfo?: {
      bankName: string;
      branchName: string;
      accountNumber: string;
      accountHolder: string;
    };
    onlinePaymentLink?: string;
    qrCode?: string;
  };
  fallbackMessage?: string;
}

describe('顧客向けポータル - 請求書詳細表示 (GMO Payment Gateway失敗時)', () => {
  let mockPaymentGatewayAdapter: PaymentGatewayAdapter;

  beforeEach(() => {
    mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };
  });

  // SCEN-172
  test('GMO Payment Gateway連携 - generatePaymentLinkが失敗した場合、請求書に銀行振込先情報のみが表示される', async () => {
    const invoiceData: Invoice = {
      id: 'INV-20240115-001',
      customerId: 'CUST-001',
      amount: 100000,
      customerEmail: 'customer@example.com',
      bankName: '山田銀行',
      branchName: '東京支店',
      accountNumber: '1234567',
      accountHolder: 'サンプル株式会社',
    };

    const paymentGatewayError = new Error('Payment gateway service unavailable');

    (mockPaymentGatewayAdapter.generatePaymentLink as jest.Mock).mockRejectedValueOnce(
      paymentGatewayError
    );

    const result: InvoiceDisplayResult = await displayInvoiceDetail(
      invoiceData,
      mockPaymentGatewayAdapter
    );

    expect(result.invoice).toEqual(invoiceData);

    expect(result.paymentMethod.type).toBe('bank_transfer');

    expect(result.paymentMethod.bankInfo).toEqual({
      bankName: '山田銀行',
      branchName: '東京支店',
      accountNumber: '1234567',
      accountHolder: 'サンプル株式会社',
    });

    expect(result.paymentMethod.onlinePaymentLink).toBeUndefined();
    expect(result.paymentMethod.qrCode).toBeUndefined();

    expect(result.fallbackMessage).toBe(
      '支払いリンクの生成に失敗しました。銀行振込でお支払いください'
    );

    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith(
      invoiceData.id,
      invoiceData.amount
    );
  });
});