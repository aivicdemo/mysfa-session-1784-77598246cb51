import { sendInvoiceNotification } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - Google Workspace メール API連携', () => {
  // SCEN-1004
  test('sendInvoiceNotificationが成功応答を受けた場合、顧客へ請求書発行通知が送信され、ステータスが更新される', async () => {
    const customerEmail = 'customer@example.com';
    const invoiceId = 'INV-2024-001';
    const invoiceAmount = 150000;
    const paymentDeadline = '2024-02-28';
    const messageId = 'msg_12345';
    const sendTimestamp = new Date('2024-01-15T11:00:00Z');

    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        statusCode: 200,
        messageId: messageId,
        sentAt: sendTimestamp.toISOString(),
      }),
    };

    const mockEmailLogRepository = {
      addLog: jest.fn().mockResolvedValue({
        id: 'log_001',
        invoiceId: invoiceId,
        customerEmail: customerEmail,
        messageId: messageId,
        sentAt: sendTimestamp.toISOString(),
        status: 'sent',
      }),
    };

    const mockInvoiceRepository = {
      updateStatus: jest.fn().mockResolvedValue({
        id: invoiceId,
        status: 'notified',
        notificationSentAt: sendTimestamp.toISOString(),
      }),
    };

    const result = await sendInvoiceNotification(
      {
        customerEmail,
        invoiceId,
        invoiceAmount,
        paymentDeadline,
      },
      mockNotificationServiceAdapter,
      mockEmailLogRepository,
      mockInvoiceRepository
    );

    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledWith({
      customerEmail,
      invoiceId,
      invoiceAmount,
      paymentDeadline,
    });

    expect(mockInvoiceRepository.updateStatus).toHaveBeenCalledTimes(1);
    expect(mockInvoiceRepository.updateStatus).toHaveBeenCalledWith(invoiceId, 'notified');

    expect(mockEmailLogRepository.addLog).toHaveBeenCalledTimes(1);
    expect(mockEmailLogRepository.addLog).toHaveBeenCalledWith({
      invoiceId,
      customerEmail,
      messageId,
      sentAt: sendTimestamp.toISOString(),
      status: 'sent',
    });

    expect(result).toEqual({
      success: true,
      invoiceId,
      messageId,
      customerEmail,
      notificationStatus: 'notified',
      logId: 'log_001',
      sentAt: sendTimestamp.toISOString(),
    });
  });
});