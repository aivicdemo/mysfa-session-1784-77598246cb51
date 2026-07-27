import { issueInvoice } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-158
  test('[normal] Google Workspace メール API連携 - sendInvoiceNotificationが成功応答を返した場合、請求書発行時に顧客メールアドレスへメールが送信される', () => {
    // Arrange
    const customerId = 'CUST-001';
    const customerEmail = 'customer@example.com';
    const invoiceId = 'INV-20250515-001';
    const invoiceAmount = 150000;
    const issueDate = new Date('2025-05-15T10:30:00Z');

    const mockNotificationAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        statusCode: 200,
        messageId: 'MSG-20250515-12345',
        timestamp: new Date('2025-05-15T10:30:01Z').toISOString(),
      }),
    };

    const invoiceData = {
      invoiceId,
      customerId,
      customerEmail,
      amount: invoiceAmount,
      issueDate,
      status: '未発行',
    };

    // Act
    const result = issueInvoice(invoiceData, mockNotificationAdapter);

    // Assert
    expect(mockNotificationAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    expect(mockNotificationAdapter.sendInvoiceNotification).toHaveBeenCalledWith(
      customerEmail,
      {
        invoiceId,
        amount: invoiceAmount,
        issueDate: issueDate.toISOString(),
      }
    );
    expect(result.status).toBe('発行済み');
    expect(result.invoiceId).toBe(invoiceId);
  });
});