import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { verifyInvoiceDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

const fetchMock = require('jest-fetch-mock');

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-624
  test('[normal] 商談ステータスが『受注』で請求書発行日が商談クローズ日と完全一致するとき、ズレなしと判定される', () => {
    const dealId = 'DEAL-001';
    const dealStatus = '受注';
    const dealCloseDate = '2024-01-15';
    const invoiceIssuedDate = '2024-01-15';

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-12345',
        url: 'https://example.com/invoices/DOC-12345.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.com/share/abc123def456',
      }),
      deleteDocument: jest.fn().mockResolvedValue({
        success: true,
      }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-Q001',
        status: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-O001',
        status: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-I001',
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        messageId: 'MSG-I001',
        deliveryStatus: 'delivered',
        openedAt: '2024-01-15T14:30:00Z',
      }),
    };

    const testInput = {
      dealId,
      dealStatus,
      dealCloseDate,
      invoiceIssuedDate,
      documentStorageAdapter: mockDocumentStorageAdapter,
      notificationServiceAdapter: mockNotificationServiceAdapter,
    };

    const result = verifyInvoiceDiscrepancy(testInput);

    expect(result.discrepancyDetected).toBe(false);
    expect(result.dealId).toBe('DEAL-001');
    expect(result.status).toBe('受注');
    expect(result.dealCloseDate).toBe('2024-01-15');
    expect(result.invoiceIssuedDate).toBe('2024-01-15');
    expect(result.judgement).toBe('ズレなし');
    expect(result.mismatchFlag).toBe(false);
    expect(result.warningMessage).toBe('');
    expect(result.logEntry).toEqual({
      dealId: 'DEAL-001',
      status: '受注',
      dealCloseDate: '2024-01-15',
      invoiceIssuedDate: '2024-01-15',
      judgement: 'ズレなし',
    });
  });
});