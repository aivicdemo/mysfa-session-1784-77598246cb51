import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { retryFailedInvoiceNotification } from '../../src/logic/it-1784969823049-2-1-2';

interface NotificationQueue {
  taskId: string;
  invoiceId: string;
  customerEmail: string;
  failureTimestamp: string;
  status: 'pending' | 'sent' | 'failed';
}

interface InvoiceNotificationRequest {
  invoiceId: string;
  customerEmail: string;
  invoiceAmount: number;
  dueDate: string;
}

interface NotificationServiceAdapter {
  sendInvoiceNotification(request: InvoiceNotificationRequest): Promise<{ success: boolean; messageId?: string; error?: string }>;
}

interface QueueStore {
  getFailedTasks(): Promise<NotificationQueue[]>;
  removeTask(taskId: string): Promise<void>;
  updateTaskStatus(taskId: string, status: 'sent' | 'failed'): Promise<void>;
}

describe('Google Workspace メール API連携 - メール送信失敗時の手動再送信', () => {
  // SCEN-164
  test('メール送信失敗後、管理画面から手動再送信が可能になる', async () => {
    // Setup: メモリベースのキューストア
    const inMemoryQueue: NotificationQueue[] = [];
    const queueStore: QueueStore = {
      getFailedTasks: async () => inMemoryQueue,
      removeTask: async (taskId: string) => {
        const index = inMemoryQueue.findIndex((task) => task.taskId === taskId);
        if (index !== -1) {
          inMemoryQueue.splice(index, 1);
        }
      },
      updateTaskStatus: async (taskId: string, status: 'sent' | 'failed') => {
        const task = inMemoryQueue.find((t) => t.taskId === taskId);
        if (task) {
          task.status = status;
        }
      },
    };

    // 初回送信が失敗するようスタブ設定
    let sendInvoiceCallCount = 0;
    const notificationServiceAdapterFirstFailure: NotificationServiceAdapter = {
      sendInvoiceNotification: async (request: InvoiceNotificationRequest) => {
        sendInvoiceCallCount++;
        if (sendInvoiceCallCount === 1) {
          // 初回は失敗
          return { success: false, error: 'Service temporarily unavailable' };
        }
        // 2回目以降は成功
        return { success: true, messageId: `msg-${Date.now()}` };
      },
    };

    const invoiceId = 'INV-20240115-001';
    const customerEmail = 'customer@example.com';
    const failureTimestamp = '2024-01-15T11:30:00Z';
    const taskId = `task-${invoiceId}-${failureTimestamp}`;

    // 初回送信リクエスト（失敗シナリオ）
    const invoiceNotificationRequest: InvoiceNotificationRequest = {
      invoiceId: invoiceId,
      customerEmail: customerEmail,
      invoiceAmount: 100000,
      dueDate: '2024-02-15',
    };

    // 初回送信失敗時の処理：キューに記録
    const firstResponse = await notificationServiceAdapterFirstFailure.sendInvoiceNotification(
      invoiceNotificationRequest
    );

    if (!firstResponse.success) {
      inMemoryQueue.push({
        taskId: taskId,
        invoiceId: invoiceId,
        customerEmail: customerEmail,
        failureTimestamp: failureTimestamp,
        status: 'failed',
      });
    }

    // 管理画面でキュー一覧を確認
    const failedTasks = await queueStore.getFailedTasks();
    expect(failedTasks).toHaveLength(1);
    expect(failedTasks[0].invoiceId).toBe(invoiceId);
    expect(failedTasks[0].customerEmail).toBe(customerEmail);
    expect(failedTasks[0].status).toBe('failed');

    // 手動再送信実行（retryFailedInvoiceNotification関数を呼び出し）
    const retryResult = await retryFailedInvoiceNotification(
      taskId,
      invoiceNotificationRequest,
      notificationServiceAdapterFirstFailure,
      queueStore
    );

    // 期待結果の検証
    // 1. 再送信が実行され、成功レスポンスが返される
    expect(retryResult.success).toBe(true);
    expect(retryResult.messageId).toBeDefined();

    // 2. システム内部のメールキューから該当タスクが削除される
    const remainingTasks = await queueStore.getFailedTasks();
    expect(remainingTasks).toHaveLength(0);

    // 3. NotificationServiceAdapterのsendInvoiceNotificationが2回呼び出されたことを確認
    expect(sendInvoiceCallCount).toBe(2);
  });
});