import { generateInvoiceWithFallback } from '../../src/logic/it-1-1';

interface PaymentGatewayAdapter {
  generatePaymentLink: (invoiceId: string, amount: number) => Promise<string>;
}

interface Invoice {
  invoiceId: string;
  amount: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  paymentMessage?: string;
  bankTransferInfo?: {
    bankName: string;
    branchName: string;
    accountNumber: string;
  };
  status: string;
}

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-612
  test('PaymentGatewayAdapterのgeneratePaymentLinkが3回の指数バックオフ再試行後も失敗した場合、銀行振込対応にフォールバックする', async () => {
    const invoiceTestData: Invoice = {
      invoiceId: 'INV-20240115-001',
      amount: 100000,
      customerId: 'CUST-001',
      customerName: '株式会社テスト顧客',
      customerEmail: 'customer@example.com',
    };

    const bankTransferFallbackInfo = {
      bankName: '○○銀行',
      branchName: '本店',
      accountNumber: '1234567',
    };

    let callCount = 0;
    const mockPaymentGatewayAdapter: PaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(async () => {
        callCount += 1;
        throw new Error('決済ゲートウェイ一時的に利用不可');
      }),
    };

    const result = await generateInvoiceWithFallback(
      invoiceTestData,
      mockPaymentGatewayAdapter,
      bankTransferFallbackInfo
    );

    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(4);
    expect(result.paymentMessage).toBe(
      '支払いリンクの生成に失敗しました。銀行振込でお支払いください'
    );
    expect(result.bankTransferInfo).toEqual(bankTransferFallbackInfo);
    expect(result.status).toBe('銀行振込対応');
    expect(result.invoiceId).toBe('INV-20240115-001');
    expect(result.amount).toBe(100000);
  });
});