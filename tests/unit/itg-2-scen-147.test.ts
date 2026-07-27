import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-147
  test('AuditLogExporterの再試行が最大5回を超えるとき、内部キューに保持して検証を続行する', async () => {
    // スタブ: AWS CloudTrail/CloudWatch Logs API
    let logUserAccessCallCount = 0;
    const mockAuditLogExporter = {
      logUserAccess: jest.fn(async () => {
        logUserAccessCallCount++;
        // 最初の5回すべてを失敗させる
        if (logUserAccessCallCount <= 5) {
          throw new Error('Service Unavailable');
        }
        return { success: true };
      }),
      logDataAccess: jest.fn(async () => ({ success: true })),
      logPermissionChange: jest.fn(async () => ({ success: true })),
      queryAuditLog: jest.fn(async () => []),
    };

    // 入力: ユーザーアクセス操作とログ送信
    const inputData = {
      userId: 'user-12345',
      operationType: 'DataAccess',
      timestamp: new Date('2024-06-15T10:00:00Z'),
      auditLogExporter: mockAuditLogExporter,
    };

    // 実行: validateInvoiceApprovalを呼び出す
    const result = await validateInvoiceApproval(inputData);

    // 検証1: logUserAccessが最大5回呼び出されたこと
    expect(mockAuditLogExporter.logUserAccess).toHaveBeenCalledTimes(5);

    // 検証2: 6回目の呼び出しが実行されていないこと
    expect(logUserAccessCallCount).toBe(5);

    // 検証3: 失敗したログイベントが内部キューに保持されていること
    expect(result).toHaveProperty('auditLogRetryQueue');
    expect(Array.isArray(result.auditLogRetryQueue)).toBe(true);
    expect(result.auditLogRetryQueue.length).toBeGreaterThan(0);

    // 検証4: キューに保持されたログエントリが必要な情報を含むこと
    const queuedEntry = result.auditLogRetryQueue[0];
    expect(queuedEntry).toHaveProperty('userId');
    expect(queuedEntry.userId).toBe('user-12345');
    expect(queuedEntry).toHaveProperty('operationType');
    expect(queuedEntry.operationType).toBe('DataAccess');
    expect(queuedEntry).toHaveProperty('timestamp');
    expect(queuedEntry.timestamp).toEqual(new Date('2024-06-15T10:00:00Z'));
    expect(queuedEntry).toHaveProperty('failureCount');
    expect(queuedEntry.failureCount).toBe(5);

    // 検証5: ポータル操作が中断されずに継続可能であること
    expect(result).toHaveProperty('portalOperationContinued');
    expect(result.portalOperationContinued).toBe(true);

    // 検証6: 管理者向けアラートが発火していること
    expect(result).toHaveProperty('adminAlert');
    expect(result.adminAlert).toHaveProperty('type');
    expect(result.adminAlert.type).toBe('ログ送信エラー');
    expect(result.adminAlert).toHaveProperty('triggered');
    expect(result.adminAlert.triggered).toBe(true);
  });
});