import { describe, test, expect, beforeEach } from '@jest/globals';
import { getLinkedInvoicesByDealId } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-665
  test('商談ステータスが『受注』で紐付く請求書が1件のとき、請求書情報が正確に紐付く', () => {
    const dealId = 'DEAL-20240115-001';
    const customerId = 'CUST-A001';
    const customerName = '株式会社テスト';
    const invoiceId = 'INV-20240115-001';
    const invoiceAmountExcludingTax = 100000;
    const taxAmount = 10000;
    const invoiceAmountIncludingTax = 110000;
    const invoiceDate = new Date('2024-01-15T09:00:00Z');
    const dueDate = new Date('2024-02-15T23:59:59Z');
    const invoiceStatus = '未支払';

    const mockDealRecord = {
      id: dealId,
      customerId: customerId,
      status: '受注',
      amount: invoiceAmountExcludingTax,
      createdAt: new Date('2024-01-10T10:00:00Z'),
    };

    const mockInvoiceRecord = {
      id: invoiceId,
      dealId: dealId,
      customerId: customerId,
      customerName: customerName,
      amountExcludingTax: invoiceAmountExcludingTax,
      taxAmount: taxAmount,
      amountIncludingTax: invoiceAmountIncludingTax,
      invoiceDate: invoiceDate,
      dueDate: dueDate,
      status: invoiceStatus,
      createdAt: new Date('2024-01-15T09:00:00Z'),
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: invoiceId,
        storageUrl: 'https://storage.example.com/invoices/INV-20240115-001.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/d/abc123xyz',
        expiresAt: new Date('2024-01-22T09:00:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockInvoiceDataSource = {
      getInvoicesByDealId: jest.fn().mockReturnValue([mockInvoiceRecord]),
    };

    const result = getLinkedInvoicesByDealId(
      dealId,
      mockInvoiceDataSource,
      mockDocumentStorageAdapter
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(1);

    const linkedInvoice = result[0];
    expect(linkedInvoice.id).toBe(invoiceId);
    expect(linkedInvoice.dealId).toBe(dealId);
    expect(linkedInvoice.customerId).toBe(customerId);
    expect(linkedInvoice.customerName).toBe(customerName);
    expect(linkedInvoice.amountExcludingTax).toBe(invoiceAmountExcludingTax);
    expect(linkedInvoice.taxAmount).toBe(taxAmount);
    expect(linkedInvoice.amountIncludingTax).toBe(invoiceAmountIncludingTax);
    expect(linkedInvoice.invoiceDate).toEqual(invoiceDate);
    expect(linkedInvoice.dueDate).toEqual(dueDate);
    expect(linkedInvoice.status).toBe(invoiceStatus);

    expect(mockInvoiceDataSource.getInvoicesByDealId).toHaveBeenCalledWith(dealId);
  });
});