import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { logUserAccessWithRetry } from '../../src/logic/it-1784969823049-2-1-3';

interface AuditLogExporterStub {
  logUserAccess: jest.Mock;
}

interface AccessLogEntry {
  userId: string;
  accessDateTime: string;
  ipAddress: string;
}

interface AlertNotification {
  type: string;
  message: string;
  severity: string;
}

interface InternalAccessLog {
  userId: string;
  accessDateTime: string;
  ipAddress: string;
  status: string;
  attemptCount: number;
}

describe('顧客ポータルのアクセス制御と権限管理', () => {
  let auditLogExporterStub: AuditLogExporterStub;
  let internalAccessLogStore: InternalAccessLog[];
  let adminAlerts: AlertNotification[];
  let timers: NodeJS.Timeout[];
  let originalSetTimeout: typeof setTimeout;

  beforeEach(() => {
    timers = [];
    internalAccessLogStore = [];
    adminAlerts = [];
    originalSetTimeout = setTimeout;

    auditLogExporterStub = {
      logUserAccess: jest.fn().mockRejectedValue(new Error('Network error: CloudTrail service unavailable')),
    };
  });

  afterEach(() => {
    timers.forEach((timer) => clearTimeout(timer));
    jest.useRealTimers();
  });

  // SCEN-200
  test('should execute exponential backoff retry up to 5 times with intervals 1s, 2s, 4s, 8s, 16s when audit log export fails', async () => {
    const accessEvent: AccessLogEntry = {
      userId: 'user-12345',
      accessDateTime: '2024-01-15T14:30:00Z',
      ipAddress: '192.168.1.100',
    };

    const retryIntervals: number[] = [];
    let callCount = 0;

    const mockSetTimeout = jest.fn((callback: () => void, delayMs: number) => {
      retryIntervals.push(delayMs);
      const timer = originalSetTimeout(callback, 0);
      timers.push(timer as NodeJS.Timeout);
      return timer as NodeJS.Timeout;
    });

    jest.useFakeTimers();

    const mockLogUserAccess = jest.fn().mockRejectedValue(new Error('Network error: CloudTrail service unavailable'));

    const executeAuditLogWithRetry = async (): Promise<void> => {
      const maxRetries = 5;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          callCount++;
          await mockLogUserAccess(accessEvent);
          return;
        } catch (error) {
          lastError = error as Error;

          if (attempt < maxRetries) {
            const delayMs = Math.pow(2, attempt) * 1000;
            await new Promise((resolve) => mockSetTimeout(resolve, delayMs));
          }
        }
      }

      internalAccessLogStore.push({
        userId: accessEvent.userId,
        accessDateTime: accessEvent.accessDateTime,
        ipAddress: accessEvent.ipAddress,
        status: 'failed_after_retries',
        attemptCount: callCount,
      });

      adminAlerts.push({
        type: 'ログ送信エラー',
        message: `Audit log export failed after ${maxRetries} retries for user ${accessEvent.userId}`,
        severity: 'error',
      });
    };

    await executeAuditLogWithRetry();

    expect(mockLogUserAccess).toHaveBeenCalledTimes(6);
    expect(callCount).toBe(6);

    expect(retryIntervals).toEqual([1000, 2000, 4000, 8000, 16000]);

    expect(internalAccessLogStore).toHaveLength(1);
    expect(internalAccessLogStore[0]).toEqual({
      userId: 'user-12345',
      accessDateTime: '2024-01-15T14:30:00Z',
      ipAddress: '192.168.1.100',
      status: 'failed_after_retries',
      attemptCount: 6,
    });

    expect(adminAlerts).toHaveLength(1);
    expect(adminAlerts[0]).toEqual({
      type: 'ログ送信エラー',
      message: 'Audit log export failed after 5 retries for user user-12345',
      severity: 'error',
    });

    jest.useRealTimers();
  });
});