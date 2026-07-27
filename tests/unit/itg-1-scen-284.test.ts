import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import * as logic from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求データの紐付け・可視化 - 商談金額が0円のエッジケース', () => {
  let mockDocumentStorageAdapter: any;
  let systemLogCapture: string[];

  beforeEach(() => {
    systemLogCapture = [];
    
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc_001',
        url: 'https://example.com/docs/doc_001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.com/share/token_abc123',
        expiresAt: '2024-12-31T23:59:59Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    console.log = jest.fn((...args) => {
      systemLogCapture.push(`[LOG] ${args.join(' ')}`);
      originalConsoleLog(...args);
    });
    console.warn = jest.fn((...args) => {
      systemLogCapture.push(`[WARN] ${args.join(' ')}`);
      originalConsoleWarn(...args);
    });
    console.error = jest.fn((...args) => {
      systemLogCapture.push(`[ERROR] ${args.join(' ')}`);
      originalConsoleError(...args);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-284
  test('should correctly compare deal with zero amount against invoice with 50000 amount without division by zero error', async () => {
    const dealRecord = {
      dealId: 'deal_20240115_001',
      customerId: 'cust_abc123',
      dealAmount: 0,
      dealStatus: 'CLOSED_WON',
      dealClosedDate: '2024-01-15T10:30:00Z',
      dealDescription: 'Zero amount deal for testing',
    };

    const invoiceRecord = {
      invoiceId: 'inv_20240115_001',
      customerId: 'cust_abc123',
      invoiceAmount: 50000,
      invoiceDate: '2024-01-15T14:00:00Z',
      invoiceStatus: 'ISSUED',
      dealId: dealRecord.dealId,
    };

    const comparisonResult = await logic.compareAndVisualizeDealInvoiceAlignment({
      deal: dealRecord,
      invoice: invoiceRecord,
      documentStorageAdapter: mockDocumentStorageAdapter,
    });

    expect(comparisonResult).toBeDefined();
    expect(comparisonResult.dealAmount).toBe(0);
    expect(comparisonResult.invoiceAmount).toBe(50000);
    expect(comparisonResult.amountDifference).toBe(50000);
    expect(comparisonResult.differencePercentage).toBe(Infinity);
    expect(comparisonResult.alignmentStatus).toBe('MISALIGNED');
    expect(comparisonResult.comparisonSummary).toEqual({
      dealAmount: '0 円',
      invoiceAmount: '50,000 円',
      difference: '50,000 円',
      alignmentMessage: '商談金額と請求金額が一致していません',
    });

    expect(comparisonResult.divisionByZeroErrorOccurred).toBe(false);
    expect(comparisonResult.systemException).toBeNull();

    const warningLogs = systemLogCapture.filter(log => log.includes('[WARN]'));
    const errorLogs = systemLogCapture.filter(log => log.includes('[ERROR]'));

    expect(warningLogs.length).toBe(0);
    expect(errorLogs.length).toBe(0);

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
  });
});