import { generateAndSendInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-606
  test('請求書自動生成機能 - NotificationServiceAdapterのsendInvoiceNotificationが1回目失敗時、指数バックオフで再試行する', async () => {
    // Arrange: NotificationServiceAdapterのスタブを準備
    const mockNotificationAdapter = {
      sendInvoiceNotification: jest.fn(),
    };

    let callCount = 0;
    const callTimestamps: number[] = [];

    mockNotificationAdapter.sendInvoiceNotification.mockImplementation(
      async (invoiceData: any) => {
        callCount++;
        callTimestamps.push(Date.now());

        if (callCount === 1) {
          // 1回目: ネットワークタイムアウトエラーを返す
          throw new Error('Network timeout');
        } else if (callCount === 2) {
          // 2回目以降: 成功レスポンスを返す
          return {
            status: 'delivered',
            messageId: 'msg_12345',
            sentAt: '2024-01-15T11:00:00Z',
          };
        }
      }
    );

    const invoiceData = {
      invoiceId: 'INV_001',
      customerId: 'CUST_001',
      customerEmail: 'customer@example.com',
      amount: 100000,
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      items: [
        {
          productName: 'Service A',
          quantity: 1,
          unitPrice: 100000,
        },
      ],
    };

    // Act: 請求書発行イベントをトリガー
    const result = await generateAndSendInvoice(
      invoiceData,
      mockNotificationAdapter
    );

    // Assert: 検証
    // 1. メール送信が最終的に完了したことを確認
    expect(result).toEqual({
      status: 'delivered',
      messageId: 'msg_12345',
      sentAt: '2024-01-15T11:00:00Z',
    });

    // 2. スタブへの呼び出しが合計2回であることを検証
    expect(mockNotificationAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(
      2
    );

    // 3. 1回目と2回目の呼び出しの時間差が指数バックオフの5秒であることを検証
    expect(callTimestamps.length).toBe(2);
    const timeDifferenceMs = callTimestamps[1] - callTimestamps[0];
    const expectedBackoffMs = 5000; // 5秒
    const toleranceMs = 1000; // 1秒の許容範囲
    expect(timeDifferenceMs).toBeGreaterThanOrEqual(
      expectedBackoffMs - toleranceMs
    );
    expect(timeDifferenceMs).toBeLessThanOrEqual(
      expectedBackoffMs + toleranceMs
    );

    // 4. 各呼び出しで正しい引数が渡されたことを確認
    expect(mockNotificationAdapter.sendInvoiceNotification).toHaveBeenNthCalledWith(
      1,
      invoiceData
    );
    expect(mockNotificationAdapter.sendInvoiceNotification).toHaveBeenNthCalledWith(
      2,
      invoiceData
    );
  });
});