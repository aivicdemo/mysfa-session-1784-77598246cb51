import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  detectInvoiceDelayAndMismatch,
} from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書の自動照合・ズレ検出機能', () => {
  let mockDocumentStorageAdapter: any;
  let mockNotificationServiceAdapter: any;
  let mockPaymentGatewayAdapter: any;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-581
  test('請求予定日が不正な日付形式の場合、例外が発生し、ステータスは変わらず、外部サービス連携は呼び出されない', () => {
    const dealWithInvalidDateFormat = {
      deal_id: 'DEAL-001',
      customer_name: 'TestCustomer Inc.',
      status: '見積確定',
      amount: 150000,
      estimated_invoice_date: '2024-13-45',
      invoice_issued_date: null,
      invoice_id: null,
    };

    expect(() => {
      detectInvoiceDelayAndMismatch(
        dealWithInvalidDateFormat,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      );
    }).toThrow(/日付形式/);

    expect(dealWithInvalidDateFormat.status).toBe('見積確定');
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });

  test('請求予定日がテキスト文字列の場合、例外が発生し、ステータスは変わらず、外部サービス連携は呼び出されない', () => {
    const dealWithTextDateFormat = {
      deal_id: 'DEAL-002',
      customer_name: 'TestCustomer B',
      status: '見積確定',
      amount: 200000,
      estimated_invoice_date: 'abc',
      invoice_issued_date: null,
      invoice_id: null,
    };

    expect(() => {
      detectInvoiceDelayAndMismatch(
        dealWithTextDateFormat,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      );
    }).toThrow(/日付形式/);

    expect(dealWithTextDateFormat.status).toBe('見積確定');
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });

  test('請求予定日が null 文字列の場合、例外が発生し、ステータスは変わらず、外部サービス連携は呼び出されない', () => {
    const dealWithNullDateFormat = {
      deal_id: 'DEAL-003',
      customer_name: 'TestCustomer C',
      status: '見積確定',
      amount: 250000,
      estimated_invoice_date: 'null',
      invoice_issued_date: null,
      invoice_id: null,
    };

    expect(() => {
      detectInvoiceDelayAndMismatch(
        dealWithNullDateFormat,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      );
    }).toThrow(/日付形式/);

    expect(dealWithNullDateFormat.status).toBe('見積確定');
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });

  test('請求予定日が不正なスラッシュ区切り形式の場合、例外が発生し、ステータスは変わらず、外部サービス連携は呼び出されない', () => {
    const dealWithSlashDateFormat = {
      deal_id: 'DEAL-004',
      customer_name: 'TestCustomer D',
      status: '見積確定',
      amount: 300000,
      estimated_invoice_date: '2024/13/45',
      invoice_issued_date: null,
      invoice_id: null,
    };

    expect(() => {
      detectInvoiceDelayAndMismatch(
        dealWithSlashDateFormat,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      );
    }).toThrow(/日付形式/);

    expect(dealWithSlashDateFormat.status).toBe('見積確定');
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
  });
});