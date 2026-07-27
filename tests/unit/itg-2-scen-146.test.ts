import { jest } from '@jest/globals';

// Mock type definitions for external service adapter and internal storage
interface AuditLogEvent {
  user_id: string;
  operation_type: string;
  timestamp: string;
  action: string;
  source?: string;
  status?: string;
}

interface AuditLogExporter {
  logUserAccess: (event: AuditLogEvent) => Promise<void>;
}

interface AccessLogRecord {
  user_id: string;
  operation_type: string;
  timestamp: string;
  action: string;
  source: string;
  status: string;
}

interface AdminAlert {
  message: string;
  severity: 'error' | 'warning' | 'info';
  timestamp: string;
}

interface InvoiceApprovalVerifier {
  verifyInvoiceApprovalWithAuditFallback: (
    auditLogExporter: AuditLogExporter,
    accessLogStorage: { insert: (record: AccessLogRecord) => Promise<void>; query: (filter: Partial<AccessLogRecord>) => Promise<AccessLogRecord[]> },
    adminAlertService: { publish: (alert: AdminAlert) => Promise<void> },
    userPortalEvent: AuditLogEvent
  ) => Promise<void>;
}

// Import the actual logic function
import { verifyInvoiceApprovalWithAuditFallback } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル商談情報参照機能 - 請求書承認検証とログフォールバック', () => {
  // SCEN-146
  test('AuditLogExporterがログ記録に失敗したとき、内部のアクセスログテーブルにフォールバック記録し、管理者アラートを発行する', async () => {
    // テストデータ準備
    const testUserId = 'USER-001';
    const testOperationType = 'logUserAccess';
    const testTimestamp = '2024-01-15T10:30:00Z';
    const testAction = 'ポータルログイン';

    const userPortalEvent: AuditLogEvent = {
      user_id: testUserId,
      operation_type: testOperationType,
      timestamp: testTimestamp,
      action: testAction,
    };

    // AuditLogExporter スタブ: logUserAccess呼び出し時にエラーを発生させる
    let callCount = 0;
    const auditLogExporterStub: AuditLogExporter = {
      logUserAccess: jest.fn(async () => {
        callCount++;
        throw new Error('Connection timeout');
      }),
    };

    // 内部アクセスログテーブルストレージのモック
    const accessLogRecords: AccessLogRecord[] = [];
    const accessLogStorageMock = {
      insert: jest.fn(async (record: AccessLogRecord) => {
        accessLogRecords.push(record);
      }),
      query: jest.fn(async (filter: Partial<AccessLogRecord>) => {
        return accessLogRecords.filter((record) =>
          Object.entries(filter).every(([key, value]) => record[key as keyof AccessLogRecord] === value)
        );
      }),
    };

    // 管理者アラートサービスのモック
    const adminAlerts: AdminAlert[] = [];
    const adminAlertServiceMock = {
      publish: jest.fn(async (alert: AdminAlert) => {
        adminAlerts.push(alert);
      }),
    };

    // 機能実行: 顧客がポータルにアクセスしユーザーアクションを実行
    await verifyInvoiceApprovalWithAuditFallback(
      auditLogExporterStub,
      accessLogStorageMock,
      adminAlertServiceMock,
      userPortalEvent
    );

    // 期待結果の検証

    // 1. AuditLogExporterのlogUserAccessが最大5回呼ばれていることを確認
    expect(auditLogExporterStub.logUserAccess).toHaveBeenCalledTimes(5);

    // 2. 内部アクセスログテーブルにフォールバック記録が存在することを確認
    const fallbackRecords = await accessLogStorageMock.query({
      user_id: testUserId,
      operation_type: testOperationType,
      source: 'fallback',
      status: 'recorded',
    });

    expect(fallbackRecords).toHaveLength(1);
    expect(fallbackRecords[0]).toEqual({
      user_id: 'USER-001',
      operation_type: 'logUserAccess',
      timestamp: '2024-01-15T10:30:00Z',
      action: 'ポータルログイン',
      source: 'fallback',
      status: 'recorded',
    });

    // 3. 管理者向けアラートが発行されていることを確認
    expect(adminAlertServiceMock.publish).toHaveBeenCalledTimes(1);
    expect(adminAlerts).toHaveLength(1);
    expect(adminAlerts[0].message).toMatch(/ログ送信エラー/);
    expect(adminAlerts[0].message).toMatch(/AuditLogExporter/);
    expect(adminAlerts[0].message).toMatch(/接続失敗/);
    expect(adminAlerts[0].message).toMatch(/内部キューにフォールバック記録済み/);
    expect(adminAlerts[0].severity).toBe('error');

    // 4. accessLogStorageMock.insertが1回呼ばれていることを確認（ポータル利用者へのエラー通知がないことを暗に確認）
    expect(accessLogStorageMock.insert).toHaveBeenCalledTimes(1);
    expect(accessLogStorageMock.insert).toHaveBeenCalledWith({
      user_id: 'USER-001',
      operation_type: 'logUserAccess',
      timestamp: '2024-01-15T10:30:00Z',
      action: 'ポータルログイン',
      source: 'fallback',
      status: 'recorded',
    });
  });
});