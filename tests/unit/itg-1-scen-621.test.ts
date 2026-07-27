import { generateInvoiceFromQuoteDetails } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-621
  test('複数の見積明細の組み合わせで、順序を逆にした場合でも請求金額の合計は変わらない', () => {
    // テスト用の見積明細データセット A を準備
    const quoteDetailsA = [
      {
        itemId: 'ITEM001',
        itemName: '商品1',
        unitPrice: 10000,
        quantity: 1,
        amount: 10000,
      },
      {
        itemId: 'ITEM002',
        itemName: '商品2',
        unitPrice: 5000,
        quantity: 1,
        amount: 5000,
      },
      {
        itemId: 'ITEM003',
        itemName: '商品3',
        unitPrice: 3000,
        quantity: 1,
        amount: 3000,
      },
    ];

    // 見積明細を A の順序で請求書自動生成機能に入力
    const mockDocumentStorageAdapterSuccess = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC001',
        url: 'https://example.com/doc001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.com/share/doc001',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapterSuccess = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF001',
        status: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF002',
        status: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF003',
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'delivered',
        openedAt: new Date('2024-01-15T12:00:00Z'),
      }),
    };

    const invoiceA = generateInvoiceFromQuoteDetails(
      quoteDetailsA,
      {
        customerId: 'CUST001',
        customerName: 'テスト顧客',
        dealId: 'DEAL001',
      },
      mockDocumentStorageAdapterSuccess,
      mockNotificationServiceAdapterSuccess
    );

    const totalA = invoiceA.totalAmount;

    // 見積明細を A の逆順で請求書自動生成機能に入力
    const quoteDetailsReversed = [
      {
        itemId: 'ITEM003',
        itemName: '商品3',
        unitPrice: 3000,
        quantity: 1,
        amount: 3000,
      },
      {
        itemId: 'ITEM002',
        itemName: '商品2',
        unitPrice: 5000,
        quantity: 1,
        amount: 5000,
      },
      {
        itemId: 'ITEM001',
        itemName: '商品1',
        unitPrice: 10000,
        quantity: 1,
        amount: 10000,
      },
    ];

    const invoiceB = generateInvoiceFromQuoteDetails(
      quoteDetailsReversed,
      {
        customerId: 'CUST001',
        customerName: 'テスト顧客',
        dealId: 'DEAL001',
      },
      mockDocumentStorageAdapterSuccess,
      mockNotificationServiceAdapterSuccess
    );

    const totalB = invoiceB.totalAmount;

    // totalA と totalB が同じ値であることをアサート
    expect(totalA).toBe(totalB);

    // totalA と totalB の両方が 18,000円と等しいことをアサート
    expect(totalA).toBe(18000);
    expect(totalB).toBe(18000);
  });
});