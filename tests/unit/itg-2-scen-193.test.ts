import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { logDealDataAccess } from '../../src/logic/it-1784969823049-2-1-2';

interface AuditLogExporterAdapter {
  logDataAccess: (params: {
    userId: string;
    operationType: 'VIEW' | 'DOWNLOAD';
    dealId: string;
    timestamp: string;
    ipAddress: string;
  }) => Promise<{ success: boolean; logId: string; timestamp: string }>;
}

describe('顧客向けポータル - 商談情報参照と監査ログ記録', () => {
  // SCEN-193: AWS CloudTrail / CloudWatch Logs連携 - logDataAccessが成功応答を返した場合、商談情報の参照・ダウンロード操作が記録される
  test('should record deal data access operations (VIEW and DOWNLOAD) to audit log when logDataAccess succeeds', async () => {
    const testUserId = 'user-001';
    const testDealId = 'DEAL-5678';
    const testIpAddress = '192.168.1.100';
    const operationTimestamp = '2024-01-15T10:30:45Z';
    const auditLogResponse = {
      success: true,
      logId: 'audit-log-12345',
      timestamp: '2024-01-15T10:30:45Z',
    };

    const mockAuditLogExporter: AuditLogExporterAdapter = {
      logDataAccess: jest.fn(async () => auditLogResponse),
    };

    const viewOperationParams = {
      userId: testUserId,
      operationType: 'VIEW' as const,
      dealId: testDealId,
      timestamp: operationTimestamp,
      ipAddress: testIpAddress,
    };

    const downloadOperationParams = {
      userId: testUserId,
      operationType: 'DOWNLOAD' as const,
      dealId: testDealId,
      timestamp: operationTimestamp,
      ipAddress: testIpAddress,
    };

    const viewResult = await logDealDataAccess(
      viewOperationParams,
      mockAuditLogExporter
    );

    expect(viewResult).toEqual({
      success: true,
      logId: 'audit-log-12345',
      timestamp: '2024-01-15T10:30:45Z',
    });

    const downloadResult = await logDealDataAccess(
      downloadOperationParams,
      mockAuditLogExporter
    );

    expect(downloadResult).toEqual({
      success: true,
      logId: 'audit-log-12345',
      timestamp: '2024-01-15T10:30:45Z',
    });

    expect(mockAuditLogExporter.logDataAccess).toHaveBeenCalledTimes(2);

    const firstCallArgs = (
      mockAuditLogExporter.logDataAccess as jest.Mock
    ).mock.calls[0][0];
    expect(firstCallArgs).toEqual({
      userId: testUserId,
      operationType: 'VIEW',
      dealId: testDealId,
      timestamp: operationTimestamp,
      ipAddress: testIpAddress,
    });

    const secondCallArgs = (
      mockAuditLogExporter.logDataAccess as jest.Mock
    ).mock.calls[1][0];
    expect(secondCallArgs).toEqual({
      userId: testUserId,
      operationType: 'DOWNLOAD',
      dealId: testDealId,
      timestamp: operationTimestamp,
      ipAddress: testIpAddress,
    });
  });
});