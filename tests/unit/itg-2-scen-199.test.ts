import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  logDataAccess,
  syncAuditLogs,
  queryAuditLog,
} from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-199
  test('AWS CloudTrail / CloudWatch Logs連携 - ログ送信が失敗した場合、外部サービス復旧後に内部ログとの同期が行われる', async () => {
    // 初期状態: 外部サービス接続失敗
    const failureAuditLogExporter = {
      logDataAccess: jest.fn().mockRejectedValue(
        new Error('External service unavailable')
      ),
      queryAuditLog: jest.fn(),
    };

    // ステップ1-3: 顧客がポータルにアクセスし、商談情報を参照する操作を実行
    // logDataAccessメソッドが呼び出され、外部サービスへのログ送信が失敗することを確認
    const userId = 'customer-001';
    const operationType = 'data_access';
    const resourceId = 'deal-12345';
    const accessTimestamp = new Date('2024-03-15T10:30:00Z');

    const logResult = await logDataAccess(
      {
        userId,
        operationType,
        resourceId,
        timestamp: accessTimestamp,
      },
      failureAuditLogExporter
    );

    // ステップ4: システムが内部のアクセスログテーブルにイベントを記録したことを検証
    // 記録状態: 『未同期』、タイムスタンプ、ユーザーID、操作種別が含まれる
    expect(logResult).toEqual({
      logId: expect.any(String),
      userId: 'customer-001',
      operationType: 'data_access',
      resourceId: 'deal-12345',
      timestamp: accessTimestamp,
      syncStatus: 'unsync',
      createdAt: expect.any(Date),
    });

    // ステップ5: AuditLogExporterのスタブを『接続成功状態』に切り替え
    const successAuditLogExporter = {
      logDataAccess: jest.fn().mockResolvedValue({
        externalLogId: 'ext-log-001',
        status: 'recorded',
      }),
      queryAuditLog: jest.fn().mockResolvedValue([
        {
          logId: logResult.logId,
          userId: 'customer-001',
          operationType: 'data_access',
          resourceId: 'deal-12345',
          timestamp: accessTimestamp,
          externalLogId: 'ext-log-001',
          syncStatus: 'synced',
        },
      ]),
    };

    // ステップ6-7: ログ同期処理をトリガーする
    // システムが内部ログテーブルの未同期イベントをCloudTrail/CloudWatch Logsへ送信することを確認
    const syncResult = await syncAuditLogs(
      [logResult],
      successAuditLogExporter
    );

    // ステップ8: 送信が完了したイベントの記録状態が『同期済み』に更新されたことを検証
    expect(syncResult).toEqual([
      {
        logId: logResult.logId,
        userId: 'customer-001',
        operationType: 'data_access',
        resourceId: 'deal-12345',
        timestamp: accessTimestamp,
        externalLogId: 'ext-log-001',
        syncStatus: 'synced',
      },
    ]);

    // ステップ9: queryAuditLogメソッドで当該期間のログを検索
    // すべてのイベント（ステップ3で失敗したもの含む）が外部サービスに正常に記録されていることを確認
    const queryStartTime = new Date('2024-03-15T09:00:00Z');
    const queryEndTime = new Date('2024-03-15T12:00:00Z');

    const queryResult = await queryAuditLog(
      {
        userId: 'customer-001',
        startTime: queryStartTime,
        endTime: queryEndTime,
      },
      successAuditLogExporter
    );

    // ステップ10: 各イベントの記録状態が『同期済み』になっていることを確認
    expect(queryResult).toEqual([
      {
        logId: logResult.logId,
        userId: 'customer-001',
        operationType: 'data_access',
        resourceId: 'deal-12345',
        timestamp: accessTimestamp,
        externalLogId: 'ext-log-001',
        syncStatus: 'synced',
      },
    ]);

    // 管理者へのログ送信エラーアラートは解除される
    expect(syncResult[0].syncStatus).toBe('synced');
    expect(syncResult[0].externalLogId).toBeTruthy();
  });
});