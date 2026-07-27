import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { detectAmountDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求データの紐付け・可視化 - 金額ズレ検出', () => {
  let mockDocumentStorageAdapter: any;

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc_12345',
        url: 'https://storage.example.com/invoices/doc_12345.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://storage.example.com/share/abc123',
        expiresAt: '2024-02-15T23:59:59Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-285
  test('請求書金額が0円のとき、商談金額との金額ズレが検出される', async () => {
    const dealRecord = {
      dealId: 'DEAL_001',
      customerId: 'CUST_001',
      customerName: '株式会社テスト',
      dealAmount: 100000,
      dealStatus: '受注',
      invoiceScheduledDate: '2024-01-31',
    };

    const invoiceRecord = {
      invoiceId: 'INV_001',
      dealId: 'DEAL_001',
      customerId: 'CUST_001',
      customerName: '株式会社テスト',
      invoiceAmount: 0,
      invoiceIssuedDate: '2024-01-25',
      invoiceScheduledDate: '2024-01-31',
    };

    const result = await detectAmountDiscrepancy(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter
    );

    expect(result).toEqual({
      discrepancyDetected: true,
      discrepancyType: '請求金額不一致',
      dealAmount: 100000,
      invoiceAmount: 0,
      discrepancyAmount: 100000,
      dealId: 'DEAL_001',
      invoiceId: 'INV_001',
      customerName: '株式会社テスト',
      alertMessage: '金額ズレを検出しました',
      detailedDescription: '商談金額: 100,000円 / 請求金額: 0円 / ズレ額: 100,000円',
      isIncludedInDiscrepancyList: true,
    });

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
  });
});