import { generateAndUploadInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-600
  test('生成したPDF請求書をDocumentStorageAdapterのuploadDocumentで外部ストレージにアップロードしリンク生成に成功する', () => {
    const invoiceData = {
      customerName: '株式会社テスト',
      amount: 150000,
      issuedDate: new Date('2024-01-15T11:00:00Z'),
      invoiceNumber: 'INV-2024-001',
    };

    const documentId = 'doc_abc123xyz';
    const temporaryToken = 'token_temp_456def';
    const expectedShareLink = `https://drive.example.com/share/${documentId}?token=${temporaryToken}`;

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId,
        uploadedAt: new Date('2024-01-15T12:00:00Z'),
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: expectedShareLink,
        expiresAt: new Date('2024-01-22T12:00:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    return generateAndUploadInvoice(invoiceData, mockDocumentStorageAdapter).then(
      (result) => {
        expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
          expect.objectContaining({
            customerName: invoiceData.customerName,
            amount: invoiceData.amount,
            issuedDate: invoiceData.issuedDate,
            invoiceNumber: invoiceData.invoiceNumber,
          })
        );

        expect(mockDocumentStorageAdapter.generateShareLink).toHaveBeenCalledWith({
          documentId,
        });

        expect(result).toEqual(
          expect.objectContaining({
            documentStoragePath: expectedShareLink,
            invoiceNumber: 'INV-2024-001',
            customerName: '株式会社テスト',
            amount: 150000,
          })
        );
      }
    );
  });
});