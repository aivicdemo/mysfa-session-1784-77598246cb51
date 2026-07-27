import { validateQuoteContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-246
  test('帳票内容検証機能 - 顧客情報のメールアドレスが空の場合、警告を表示する', () => {
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const customerData = {
      customerId: 'CUST-001',
      customerName: '山田太郎',
      email: '',
      phoneNumber: '090-1234-5678',
    };

    const quoteData = {
      quoteId: 'QT-001',
      quoteAmount: 100000,
      lineItems: [
        {
          itemId: 'ITEM-001',
          itemName: '商品A',
          quantity: 1,
          unitPrice: 100000,
        },
      ],
    };

    const result = validateQuoteContent(
      customerData,
      quoteData,
      mockNotificationServiceAdapter
    );

    expect(result.isValid).toBe(false);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/メールアドレス/),
      ])
    );
    expect(result.warnings[0]).toMatch(/未入力|入力必須|空|空文字/);
    expect(mockNotificationServiceAdapter.sendQuoteNotification).not.toHaveBeenCalled();
  });
});