import { uploadDocument } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-148
  test('Google Drive API連携 - uploadDocumentが成功応答を返した場合、生成したPDFがクラウドストレージに保存される', async () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'drive-file-12345',
        url: 'https://drive.google.com/file/d/drive-file-12345',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const pdfContent = Buffer.from('PDF mock content');
    const fileName = 'invoice-2024-01-15.pdf';
    const metadata = {
      documentType: 'invoice',
      customerId: 'cust-001',
      invoiceNumber: 'INV-2024-001',
    };

    const result = await uploadDocument(
      pdfContent,
      fileName,
      metadata,
      mockDocumentStorageAdapter
    );

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      pdfContent,
      fileName,
      metadata
    );

    expect(result).toEqual({
      fileId: 'drive-file-12345',
      cloudStorageUrl: 'https://drive.google.com/file/d/drive-file-12345',
      documentStatus: 'saved',
      timestamp: expect.any(String),
    });

    expect(result.fileId).toBe('drive-file-12345');
    expect(result.cloudStorageUrl).toBe('https://drive.google.com/file/d/drive-file-12345');
    expect(result.documentStatus).toBe('saved');
  });
});