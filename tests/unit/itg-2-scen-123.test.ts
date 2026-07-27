import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

const fetchMock = require('jest-fetch-mock');

describe('顧客向けポータル - 請求書承認検証機能', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  // SCEN-123
  test('[error] 請求書承認検証機能 - 請求書に記載される顧客メールアドレスが空のとき、検証エラーが発生する', () => {
    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn(),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockAuditLogExporter = {
      logUserAccess: jest.fn(),
      logDataAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    const invoiceData = {
      invoiceNumber: 'INV-20240115-001',
      amount: 150000,
      invoiceDate: '2024-01-15',
      customerEmail: '',
      customerName: 'テスト顧客',
      paymentDueDate: '2024-02-15',
    };

    const validateFn = () => {
      validateInvoiceApproval(
        invoiceData,
        mockNotificationServiceAdapter,
        mockAuditLogExporter
      );
    };

    expect(validateFn).toThrow(/顧客メールアドレス/);
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockAuditLogExporter.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: '請求書承認検証',
        status: 'failed',
        reason: expect.stringMatching(/顧客メールアドレス/),
      })
    );
  });
});