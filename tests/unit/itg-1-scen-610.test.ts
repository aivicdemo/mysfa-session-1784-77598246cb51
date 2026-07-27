import { generateInvoiceWithPaymentFallback } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-610
  test('PaymentGatewayAdapterのgeneratePaymentLinkが失敗した場合、請求書に銀行振込先情報のみを表示する', () => {
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockRejectedValue(
        new Error('Payment link generation failed: Network timeout')
      ),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-001',
      customerName: '株式会社テスト',
      customerEmail: 'contact@test.co.jp',
      amount: 100000,
      taxAmount: 10000,
      totalAmount: 110000,
      issueDate: new Date('2024-04-01T00:00:00Z'),
      dueDate: new Date('2024-04-30T00:00:00Z'),
      items: [
        {
          itemId: 'ITEM-001',
          itemName: 'コンサルティングサービス',
          quantity: 1,
          unitPrice: 100000,
          subtotal: 100000,
        },
      ],
    };

    const result = generateInvoiceWithPaymentFallback(
      invoiceData,
      mockPaymentGatewayAdapter
    );

    expect(result.paymentMethodType).toBe('bank_transfer');
    expect(result.bankTransferInfo).toEqual({
      bankName: '株式会社テスト銀行',
      branchName: '営業部',
      accountType: '普通',
      accountNumber: '1234567',
    });
    expect(result.paymentLink).toBeUndefined();
    expect(result.userMessage).toBe(
      '支払いリンクの生成に失敗しました。銀行振込でお支払いください'
    );
    expect(result.invoiceContent.invoiceId).toBe('INV-2024-001');
    expect(result.invoiceContent.customerId).toBe('CUST-001');
    expect(result.invoiceContent.customerName).toBe('株式会社テスト');
    expect(result.invoiceContent.totalAmount).toBe(110000);
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith({
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-001',
      amount: 110000,
      currency: 'JPY',
    });
  });
});