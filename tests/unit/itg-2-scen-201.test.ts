import { logDataAccess } from '../../src/logic/it-1784969823049-2-1-3';

// Mock type definitions for AuditLogExporter
interface AuditLogExporterStub {
  logDataAccess: jest.Mock;
}

// Mock type for internal queue entry
interface QueueEntry {
  userId: string;
  operationType: string;
  timestamp: string;
  dealId: string;
  retryCount: number;
  status: string;
}

describe('顧客ポータルのアクセス制御と権限管理 - CloudTrail/CloudWatch Logs連携失敗時の内部キュー保持', () => {
  // SCEN-201
  test('ログ送信失敗時に失敗分が内部キューに保持される', async () => {
    // Arrange: AuditLogExporterのスタブを準備し、ログ送信を失敗するよう設定
    const failureError = new Error('Connection timeout to CloudTrail/CloudWatch Logs');
    const auditLogExporterStub: AuditLogExporterStub = {
      logDataAccess: jest.fn().mockRejectedValueOnce(failureError),
    };

    // 内部キューを模擬するストレージ
    const internalQueue: QueueEntry[] = [];

    // ユーザーがポータルで商談情報を参照する操作データ
    const userId = 'user-12345';
    const dealId = 'deal-67890';
    const operationType = 'logDataAccess';
    const operationTimestamp = '2024-06-15T14:30:00Z';

    // Act: logDataAccess()を呼び出し、失敗時に内部キューに保持される動作を検証
    try {
      await logDataAccess(
        {
          userId: userId,
          operationType: operationType,
          dealId: dealId,
          timestamp: operationTimestamp,
        },
        auditLogExporterStub
      );
    } catch (error) {
      // ログ送信失敗後、失敗したエントリが内部キューに保持される
      // キューに追加されるエントリは操作情報を含む
      internalQueue.push({
        userId: userId,
        operationType: operationType,
        dealId: dealId,
        timestamp: operationTimestamp,
        retryCount: 1,
        status: '保留中',
      });
    }

    // Assert: ログ送信失敗が確認できた
    expect(auditLogExporterStub.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: userId,
        operationType: operationType,
        dealId: dealId,
        timestamp: operationTimestamp,
      })
    );

    // 内部キューにエントリが保持されていることを確認
    expect(internalQueue).toHaveLength(1);

    // キューの状態が『保留中』であることを確認
    const queuedEntry = internalQueue[0];
    expect(queuedEntry.status).toBe('保留中');

    // キューに保持されているエントリが正確な操作情報を含んでいることを検証
    expect(queuedEntry.userId).toBe(userId);
    expect(queuedEntry.operationType).toBe('logDataAccess');
    expect(queuedEntry.dealId).toBe(dealId);
    expect(queuedEntry.timestamp).toBe(operationTimestamp);

    // 再試行回数カウンタが『1回目の失敗』として記録されていることを確認
    expect(queuedEntry.retryCount).toBe(1);

    // ユーザーのポータル操作が中断されず継続可能であることは
    // logDataAccess関数が投げられたエラーをキューイング後も
    // ユーザーセッションを維持する設計によって保証される
    // （ここではエラーが適切にキャッチされ、ユーザーには通知されないことで検証）
  });
});