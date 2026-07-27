import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import type { AuditLogExporter, AccessLogRecord } from '../../src/logic/it-1784969823049-2-1-3';
import { logUserAccessWithFallback } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-198
  test('AWS CloudTrail連携失敗時、イベントが内部アクセスログテーブルに記録される', async () => {
    // Arrange
    const userId = 'customer-user-001';
    const portalAccessTime = new Date('2024-01-15T14:30:00Z');
    const recordTimestamp = new Date('2024-01-15T14:30:05Z');
    const operationType = 'UserAccess';

    // アクセスログテーブルへの記録を追跡するモック
    const accessLogRecords: AccessLogRecord[] = [];
    const mockInsertAccessLog = jest.fn(async (record: AccessLogRecord): Promise<void> => {
      accessLogRecords.push(record);
    });

    // AWS CloudTrail連携スタブ：失敗を返す
    const failingAuditLogExporter: AuditLogExporter = {
      logUserAccess: jest.fn(async (): Promise<void> => {
        throw new Error('CloudTrail API timeout');
      }),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    // 管理者アラート呼び出しの追跡
    const mockAdminAlert = jest.fn(async (message: string): Promise<void> => {
      // no-op
    });

    // Act
    await logUserAccessWithFallback(
      {
        userId,
        operationType,
        portalAccessTime,
        recordTimestamp,
      },
      failingAuditLogExporter,
      mockInsertAccessLog,
      mockAdminAlert
    );

    // Assert
    // 外部サービスのlogUserAccessが呼び出されたことを確認
    expect(failingAuditLogExporter.logUserAccess).toHaveBeenCalled();

    // 内部アクセスログテーブルに記録されたことを確認
    expect(accessLogRecords.length).toBe(1);

    const recordedEvent = accessLogRecords[0];
    expect(recordedEvent.userId).toBe(userId);
    expect(recordedEvent.operationType).toBe(operationType);
    expect(recordedEvent.portalAccessTime).toEqual(portalAccessTime);
    expect(recordedEvent.recordTimestamp).toEqual(recordTimestamp);
    expect(recordedEvent.externalServiceFailureFlag).toBe(true);

    // 管理者アラートが呼び出されたことを確認
    expect(mockAdminAlert).toHaveBeenCalledWith(expect.stringMatching(/ログ送信エラー/));
  });
});