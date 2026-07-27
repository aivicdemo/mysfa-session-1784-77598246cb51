import { generateInvoiceWithDocumentFallback } from '../../src/logic/it-1-1';

interface DocumentStorageAdapterStub {
  uploadDocument: jest.Mock;
}

interface InternalStorageAdapterStub {
  saveToInternalStorage: jest.Mock;
}

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-603: [error] 請求書自動生成機能 - DocumentStorageAdapterのuploadDocumentが3回の指数バックオフ再試行後も失敗した場合、内部ストレージへのフォールバックに切り替える
  test('should fallback to internal storage after 3 exponential backoff retries fail', async () => {
    const mockPdfBuffer = Buffer.from('mock pdf content');
    const mockInvoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-123',
      customerName: 'Test Company',
      amount: 50000,
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
      items: [
        {
          description: 'Product A',
          quantity: 2,
          unitPrice: 25000,
        },
      ],
    };

    const documentStorageAdapter: DocumentStorageAdapterStub = {
      uploadDocument: jest.fn()
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Network timeout'))
        .mockRejectedValueOnce(new Error('Network timeout')),
    };

    const internalStorageAdapter: InternalStorageAdapterStub = {
      saveToInternalStorage: jest.fn().mockResolvedValue({
        filePath: '/system/temp/documents/INV-2024-001.pdf',
        fileName: 'INV-2024-001.pdf',
        storagePath: '/system/temp/documents/',
        isAccessible: true,
      }),
    };

    const result = await generateInvoiceWithDocumentFallback(
      mockInvoiceData,
      mockPdfBuffer,
      documentStorageAdapter,
      internalStorageAdapter
    );

    expect(documentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(3);
    expect(internalStorageAdapter.saveToInternalStorage).toHaveBeenCalledTimes(1);
    expect(internalStorageAdapter.saveToInternalStorage).toHaveBeenCalledWith(
      mockPdfBuffer,
      'INV-2024-001.pdf'
    );

    expect(result).toEqual({
      success: true,
      storageType: 'internal',
      filePath: '/system/temp/documents/INV-2024-001.pdf',
      fileName: 'INV-2024-001.pdf',
      isDownloadable: true,
      userMessage: '文書の保存に失敗しました。システム管理者に連絡してください',
      retryAttempts: 3,
    });
  });
});