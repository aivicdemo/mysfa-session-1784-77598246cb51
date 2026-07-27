import { issueOrderWithPastDateTime } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-061
  test('[normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 注文書の発行日時が過去の日時のとき、その日時が記録される', () => {
    const pastIssuanceDateTime = new Date('2024-01-15T10:30:00Z');
    const customerId = 'CUST-001';
    const customerName = 'Test Customer Inc.';
    const customerEmail = 'customer@example.com';
    const orderContent = {
      lineItems: [
        {
          productId: 'PROD-A',
          quantity: 5,
          unitPrice: 10000,
        },
        {
          productId: 'PROD-B',
          quantity: 3,
          unitPrice: 15000,
        },
      ],
    };
    const expectedTotalAmount = 5 * 10000 + 3 * 15000;

    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'FILE-ORDER-001',
        url: 'https://storage.example.com/orders/FILE-ORDER-001.pdf',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const notificationServiceAdapterStub = {
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-ORDER-001',
        deliveryStatus: 'sent',
      }),
      sendQuoteNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const orderIssuanceRecord = issueOrderWithPastDateTime(
      {
        customerId,
        customerName,
        customerEmail,
        orderContent,
        issuanceDateTime: pastIssuanceDateTime,
      },
      documentStorageAdapterStub,
      notificationServiceAdapterStub
    );

    expect(orderIssuanceRecord.issuanceDateTime).toEqual(pastIssuanceDateTime);
    expect(orderIssuanceRecord.issuanceDateTime.toISOString()).toBe('2024-01-15T10:30:00.000Z');
    expect(orderIssuanceRecord.totalAmount).toBe(expectedTotalAmount);
    expect(orderIssuanceRecord.customerId).toBe(customerId);
    expect(orderIssuanceRecord.customerName).toBe(customerName);
    expect(orderIssuanceRecord.status).toBe('issued');
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        documentType: 'order',
        customerId,
        issuanceDateTime: pastIssuanceDateTime,
      })
    );
    expect(notificationServiceAdapterStub.sendOrderNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId,
        customerEmail,
        issuanceDateTime: pastIssuanceDateTime,
      })
    );
  });
});