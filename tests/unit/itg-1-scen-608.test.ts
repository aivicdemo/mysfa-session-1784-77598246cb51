import { describe, test, expect, beforeEach } from '@jest/globals';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-608
  test('請求書発行時にPaymentGatewayAdapterのgeneratePaymentLinkで決済リンクを生成する', async () => {
    const { generateInvoiceWithPaymentLink } = await import('../../src/logic/it-1-1');

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkUrl: 'https://payment.gmo.example.com/pay/inv_12345_abc',
        expiresAt: new Date('2024-06-15T23:59:59Z').getTime(),
        transactionId: 'txn_xyz789',
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const invoiceData = {
      invoiceId: 'inv_12345',
      customerId: 'cust_001',
      amount: 150000,
      currency: 'JPY',
      customerEmail: 'customer@example.com',
      invoiceNumber: 'INV-2024-001',
      invoiceDate: '2024-05-15',
      dueDate: '2024-06-15',
      items: [
        {
          description: 'Product A',
          quantity: 1,
          unitPrice: 100000,
          amount: 100000,
        },
        {
          description: 'Service B',
          quantity: 1,
          unitPrice: 50000,
          amount: 50000,
        },
      ],
    };

    const result = await generateInvoiceWithPaymentLink(
      invoiceData,
      mockPaymentGatewayAdapter
    );

    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(1);
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledWith({
      invoiceId: 'inv_12345',
      amount: 150000,
      currency: 'JPY',
      customerEmail: 'customer@example.com',
    });

    expect(result.invoiceId).toBe('inv_12345');
    expect(result.paymentLinkUrl).toBe(
      'https://payment.gmo.example.com/pay/inv_12345_abc'
    );
    expect(result.expiresAt).toBe(new Date('2024-06-15T23:59:59Z').getTime());
    expect(result.transactionId).toBe('txn_xyz789');
    expect(result.status).toBe('決済リンク生成済み');
    expect(result.amount).toBe(150000);
    expect(result.customerId).toBe('cust_001');
  });
});