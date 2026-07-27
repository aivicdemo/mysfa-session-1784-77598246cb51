import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { verifyInvoiceIssuanceWithFiscalYearCrossing } from '../../src/logic/it-1784969823049-1-1-1';

// Mock for DocumentStorageAdapter
interface DocumentStorageAdapterStub {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  let documentStorageAdapterStub: DocumentStorageAdapterStub;

  beforeEach(() => {
    documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-12345',
        uploadedAt: '2024-03-15T09:00:00Z',
        storageUrl: 'https://storage.example.com/doc-12345'
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/doc-12345',
        expiresAt: '2024-04-15T23:59:59Z'
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true })
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-295
  test('商談ステータスと請求データの紐付け・可視化 - 請求書の発行日が年度をまたぐとき、期日ズレの判定が正常に実行される', async () => {
    const dealRecord = {
      dealId: 'deal-001',
      customerId: 'cust-001',
      dealAmount: 1000000,
      dealStatus: '受注',
      createdAt: '2024-01-10T08:00:00Z'
    };

    const invoiceData = {
      invoiceId: 'inv-001',
      dealId: 'deal-001',
      customerId: 'cust-001',
      invoiceAmount: 1000000,
      issueDate: new Date('2024-03-15'),
      dueDate: new Date('2024-04-15'),
      fiscalYearCrossingFlag: true,
      invoiceStatus: '発行済'
    };

    const invoiceContent = {
      invoiceId: 'inv-001',
      customerId: 'cust-001',
      amount: 1000000,
      issueDate: '2024-03-15',
      dueDate: '2024-04-15',
      items: [
        {
          itemId: 'item-001',
          description: 'Product A',
          quantity: 1,
          unitPrice: 1000000,
          lineTotal: 1000000
        }
      ]
    };

    const pdfContent = 'mock-pdf-binary-content';

    const verificationResult = await verifyInvoiceIssuanceWithFiscalYearCrossing(
      dealRecord,
      invoiceData,
      invoiceContent,
      pdfContent,
      documentStorageAdapterStub
    );

    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: 'inv-001',
        pdfContent: 'mock-pdf-binary-content'
      })
    );

    expect(verificationResult).toEqual({
      invoiceId: 'inv-001',
      dealId: 'deal-001',
      dealStatus: '受注',
      invoiceIssueDate: '2024-03-15',
      invoiceDueDate: '2024-04-15',
      fiscalYearCrossingDetected: true,
      issueDateFiscalYear: '2024年度',
      dueDateFiscalYear: '2025年度',
      verificationStatus: '警告',
      verificationReason: '発行日（2024年度）と期日（2025年度）が異なる会計年度に跨がっているため、期日ズレリスク有り',
      invoiceAttachmentId: 'doc-12345',
      invoiceAttachmentUrl: 'https://storage.example.com/doc-12345',
      recordedAt: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/)
    });

    expect(verificationResult.dealStatus).toBe('受注');
    expect(verificationResult.verificationStatus).toBe('警告');
    expect(verificationResult.verificationReason).toContain('年度に跨がっているため');
    expect(verificationResult.fiscalYearCrossingDetected).toBe(true);
    expect(verificationResult.issueDateFiscalYear).toBe('2024年度');
    expect(verificationResult.dueDateFiscalYear).toBe('2025年度');
  });
});