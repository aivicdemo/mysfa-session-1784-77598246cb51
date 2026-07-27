import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  reconcileSalesAndInvoiceStatus,
  type ReconciliationInput,
  type ReconciliationResult,
  type MismatchRecord,
} from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-977: [error] 売上実績・請求状況照合機能 - 売上実績のステータスが下書きで請求書が発行済みの場合、ステータス不整合として検出される
  test('売上実績ステータスが下書きで請求書ステータスが発行済みの場合、ステータス不整合を検出する', () => {
    const salesRecordId = 'SR-2024-001';
    const invoiceId = 'INV-2024-0001';
    const customerId = 'CUST-001';
    const invoiceAmount = 150000;

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-12345',
        fileUrl: 'https://storage.example.com/invoices/INV-2024-0001.pdf',
        uploadedAt: new Date('2024-01-15T10:30:00Z'),
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://storage.example.com/share/token123',
        expiresAt: new Date('2024-01-22T10:30:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue(true),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-QUOTE-001',
        sentAt: new Date('2024-01-15T10:30:00Z'),
        recipientEmail: 'customer@example.com',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-ORDER-001',
        sentAt: new Date('2024-01-15T10:30:00Z'),
        recipientEmail: 'customer@example.com',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-INVOICE-001',
        sentAt: new Date('2024-01-15T10:31:00Z'),
        recipientEmail: 'customer@example.com',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        messageId: 'MSG-INVOICE-001',
        deliveryStatus: 'delivered',
        openedAt: new Date('2024-01-15T11:45:00Z'),
      }),
    };

    const reconciliationInput: ReconciliationInput = {
      salesRecords: [
        {
          recordId: salesRecordId,
          customerId: customerId,
          status: 'draft',
          amount: invoiceAmount,
          accrualScheduledDate: new Date('2024-01-15T00:00:00Z'),
          linkedInvoiceId: invoiceId,
          createdAt: new Date('2024-01-15T09:00:00Z'),
        },
      ],
      invoiceRecords: [
        {
          invoiceId: invoiceId,
          customerId: customerId,
          status: 'issued',
          amount: invoiceAmount,
          issuedDate: new Date('2024-01-15T10:30:00Z'),
          linkedSalesRecordId: salesRecordId,
        },
      ],
      reconciliationDate: new Date('2024-01-15T12:00:00Z'),
      documentStorageAdapter: mockDocumentStorageAdapter,
      notificationServiceAdapter: mockNotificationServiceAdapter,
    };

    const result: ReconciliationResult = reconcileSalesAndInvoiceStatus(reconciliationInput);

    expect(result.reconciliationStatus).toBe('completed_with_mismatches');
    expect(result.mismatchCount).toBe(1);

    const mismatch: MismatchRecord | undefined = result.mismatches.find(
      (m) => m.salesRecordId === salesRecordId && m.invoiceId === invoiceId,
    );

    expect(mismatch).toBeDefined();
    expect(mismatch?.mismatchType).toBe('status_mismatch');
    expect(mismatch?.salesRecordStatus).toBe('draft');
    expect(mismatch?.invoiceStatus).toBe('issued');
    expect(mismatch?.errorMessage).toMatch(/ステータス不整合/);
    expect(mismatch?.errorMessage).toMatch(/売上実績ステータス：下書き/);
    expect(mismatch?.errorMessage).toMatch(/請求書ステータス：発行済み/);
    expect(mismatch?.detectedAt).toEqual(new Date('2024-01-15T12:00:00Z'));
    expect(mismatch?.recordedInErrorLog).toBe(true);
  });
});