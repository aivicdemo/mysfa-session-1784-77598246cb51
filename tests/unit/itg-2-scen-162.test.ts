import { issueInvoiceWithNotification } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-162: [error] Google Workspace メール API連携 - sendInvoiceNotificationが失敗した場合、利用者に「メール送信に失敗しました。手動で顧客に連絡してください」メッセージが表示される
  test('請求書発行時にメール送信が失敗した場合、エラーメッセージが表示され請求書ステータスは発行済みのままである', () => {
    const invoiceData = {
      invoiceId: 'INV-20240115-001',
      customerId: 'CUST-0001',
      customerEmail: 'customer@example.com',
      invoiceAmount: 150000,
      invoiceDate: new Date('2024-01-15T11:00:00Z'),
      dueDate: new Date('2024-02-15T11:00:00Z'),
      status: '発行済み' as const,
    };

    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockRejectedValueOnce(
        new Error('メール送信サービスが利用できません'),
      ),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const result = issueInvoiceWithNotification(invoiceData, mockNotificationServiceAdapter);

    expect(result).toEqual({
      success: false,
      invoiceStatus: '発行済み',
      errorMessage: 'メール送信に失敗しました。手動で顧客に連絡してください',
      invoiceId: 'INV-20240115-001',
    });

    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledWith({
      customerId: 'CUST-0001',
      customerEmail: 'customer@example.com',
      invoiceId: 'INV-20240115-001',
      invoiceAmount: 150000,
      invoiceDate: new Date('2024-01-15T11:00:00Z'),
    });
  });
});