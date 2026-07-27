import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import type { Deal, Invoice, ReconciliationResult } from '../../src/types';
import { reconcileDealAndInvoiceStatus } from '../../src/logic/it-1784969823049-1-1-1';

const fetchMock = require('jest-fetch-mock');

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-733
  test('[normal] 商談ステータスが「受注」で請求書が発行されている場合、照合は成功する', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-2024-001',
        storagePath: 'gs://bucket/invoices/doc-2024-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.google.com/file/d/abc123/view?usp=sharing',
        expiresAt: '2024-12-31T23:59:59Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const testDeal: Deal = {
      dealId: 'deal-2024-001',
      customerName: 'テスト顧客A',
      customerId: 'cust-2024-001',
      amount: 100000,
      dealStatus: '受注',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T11:30:00Z',
    };

    const testInvoice: Invoice = {
      invoiceId: 'inv-2024-001',
      dealId: 'deal-2024-001',
      customerId: 'cust-2024-001',
      invoiceAmount: 100000,
      invoiceStatus: '発行済み',
      issuedAt: '2024-01-15T11:30:00Z',
      dueDate: '2024-02-15T23:59:59Z',
      documentStorageId: 'doc-2024-001',
    };

    const result: ReconciliationResult = reconcileDealAndInvoiceStatus(
      testDeal,
      testInvoice,
      mockDocumentStorageAdapter
    );

    expect(result.dealStatus).toBe('受注');
    expect(result.invoiceStatus).toBe('発行済み');
    expect(result.reconciliationStatus).toBe('成功');
    expect(result.errorMessage).toBeUndefined();
    expect(result.dealAndInvoiceLinked).toBe(true);
    expect(result.dealId).toBe('deal-2024-001');
    expect(result.invoiceId).toBe('inv-2024-001');
  });
});