import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { generateInvoicePdfWithFallback } from '../../src/logic/it-1784969823049-2-1-2';

describe('Google Drive API連携 - uploadDocument失敗時の一時フォルダ保存機能', () => {
  let mockDocumentStorageAdapter: any;
  let mockFileSystemAdapter: any;
  let mockFetchAdapter: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFileSystemAdapter = {
      saveToTempFolder: jest.fn(),
      listPendingDocuments: jest.fn(),
      getPendingDocumentPath: jest.fn(),
    };

    mockFetchAdapter = {
      makeRequest: jest.fn(),
    };

    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn()
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Network timeout')),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };
  });

  // SCEN-152
  test('uploadDocumentが3回の指数バックオフ再試行全て失敗した場合、PDFがシステム内部一時フォルダに保存され管理画面で手動ダウンロード可能になること', async () => {
    const invoiceId = '12345';
    const invoiceData = {
      id: invoiceId,
      customerId: 'CUST_001',
      customerName: '顧客太郎',
      amount: 150000,
      currency: 'JPY',
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
      items: [
        {
          description: 'システム開発サービス',
          quantity: 1,
          unitPrice: 150000,
          taxRate: 0.1,
        },
      ],
    };

    const expectedTimestamp = '20240115120530';
    const expectedFileName = `invoice_${invoiceId}_${expectedTimestamp}.pdf`;
    const expectedTempFolderPath = `/tmp/pending_documents/${expectedFileName}`;
    const mockPdfBuffer = Buffer.from('%PDF-1.4 mock pdf content');

    mockFileSystemAdapter.saveToTempFolder.mockResolvedValueOnce({
      fileName: expectedFileName,
      filePath: expectedTempFolderPath,
      savedAt: new Date('2024-01-15T12:05:30Z'),
    });

    mockFileSystemAdapter.listPendingDocuments.mockResolvedValueOnce([
      {
        documentId: invoiceId,
        fileName: expectedFileName,
        filePath: expectedTempFolderPath,
        savedAt: new Date('2024-01-15T12:05:30Z'),
        size: mockPdfBuffer.length,
      },
    ]);

    mockFileSystemAdapter.getPendingDocumentPath.mockResolvedValueOnce({
      fileName: expectedFileName,
      filePath: expectedTempFolderPath,
      content: mockPdfBuffer,
      savedAt: new Date('2024-01-15T12:05:30Z'),
    });

    const result = await generateInvoicePdfWithFallback(
      invoiceData,
      mockDocumentStorageAdapter,
      mockFileSystemAdapter,
      { maxRetries: 3, backoffMultiplier: 1 }
    );

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(3);

    expect(mockFileSystemAdapter.saveToTempFolder).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: expect.stringMatching(new RegExp(`^invoice_${invoiceId}_\\d{14}\\.pdf$`)),
      })
    );

    expect(result).toEqual({
      status: 'fallback_saved',
      documentId: invoiceId,
      fileName: expectedFileName,
      filePath: expectedTempFolderPath,
      isManualDownloadRequired: true,
      retryAttempts: 3,
      invoiceAmount: 150000,
      invoiceCustomerName: '顧客太郎',
    });

    const pendingDocuments = await mockFileSystemAdapter.listPendingDocuments();
    expect(pendingDocuments).toHaveLength(1);
    expect(pendingDocuments[0]).toEqual(
      expect.objectContaining({
        documentId: invoiceId,
        fileName: expectedFileName,
        filePath: expectedTempFolderPath,
      })
    );

    const downloadedDocument = await mockFileSystemAdapter.getPendingDocumentPath(invoiceId);
    expect(downloadedDocument).toEqual(
      expect.objectContaining({
        fileName: expectedFileName,
        filePath: expectedTempFolderPath,
        content: mockPdfBuffer,
      })
    );

    expect(downloadedDocument.content).toEqual(mockPdfBuffer);
    expect(downloadedDocument.content.toString('utf8')).toMatch(/mock pdf content/);
  });
});