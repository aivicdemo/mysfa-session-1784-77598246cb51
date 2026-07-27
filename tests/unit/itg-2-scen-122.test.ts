import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-122: [error] 請求書に記載される顧客メールアドレスが無効な形式のとき、検証エラーが発生する
  test('無効なメールアドレス形式で検証エラーが発生し、NotificationServiceAdapterが呼び出されないこと', () => {
    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn(),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const invalidEmailTestCases = [
      'invalid.email@',
      'user@domain',
      '@example.com',
      'user name@example.com',
    ];

    invalidEmailTestCases.forEach((invalidEmail) => {
      const invoiceData = {
        invoiceNumber: 'INV-20240115-001',
        customerEmail: invalidEmail,
        amount: 150000,
        invoiceDate: new Date('2024-01-15T09:00:00Z'),
        customerName: 'Test Customer Inc.',
        items: [
          {
            description: 'Product A',
            quantity: 5,
            unitPrice: 30000,
          },
        ],
      };

      const result = validateInvoiceApproval(
        invoiceData,
        mockNotificationServiceAdapter
      );

      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toMatch(/メールアドレス/);
      expect(result.fieldError).toBe('customerEmail');
      expect(result.formStatePreserved).toBe(true);
      expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    });
  });
});