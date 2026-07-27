import { logUserAccessEvent } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-192
  test('AWS CloudTrail / CloudWatch Logs連携 - logUserAccessが成功応答を返した場合、ユーザーのポータルアクセスイベントが記録される', async () => {
    const mockAuditLogExporter = {
      logUserAccess: jest.fn().mockResolvedValue({
        statusCode: 200,
        confirmationId: 'audit-20240115-550e8400-e29b-41d4-a716-446655440000',
      }),
    };

    const userId = 'user-12345';
    const accessTimestamp = new Date('2024-01-15T11:30:00Z');
    const operationType = 'PortalAccess';
    const ipAddress = '192.0.2.1';
    const sessionId = 'sess-87654321';

    const result = await logUserAccessEvent(
      {
        userId,
        accessTimestamp,
        operationType,
        ipAddress,
        sessionId,
      },
      mockAuditLogExporter
    );

    expect(mockAuditLogExporter.logUserAccess).toHaveBeenCalledWith({
      userId,
      accessTimestamp,
      operationType,
      ipAddress,
      sessionId,
    });

    expect(result).toEqual({
      recorded: true,
      confirmationId: 'audit-20240115-550e8400-e29b-41d4-a716-446655440000',
      accessLog: {
        userId,
        accessTimestamp,
        operationType,
        ipAddress,
        sessionId,
      },
    });
  });
});