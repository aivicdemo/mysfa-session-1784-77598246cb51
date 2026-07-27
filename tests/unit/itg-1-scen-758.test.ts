import { describe, test, expect, beforeEach, jest } from '@jest/globals';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-758
  test('[normal] 商談ステータス・請求データ照合機能 - 請求書明細が複数件で、各明細の金額が正確に集計される', async () => {
    // Import the function to test
    const { reconcileDealStatusAndInvoiceData } = await import(
      '../../src/logic/it-1784969823049-1-1-1'
    );

    // Arrange: Create stub for DocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-12345',
        url: 'https://storage.example.com/doc-12345',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://storage.example.com/share/abc123def456',
        expiresAt: new Date('2024-02-28T23:59:59Z').toISOString(),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // Create test deal record with status "受注" (Order Confirmed)
    const dealRecord = {
      dealId: 'deal-001',
      dealName: 'テスト商談',
      customerId: 'cust-001',
      status: '受注',
      dealAmount: 49000,
      invoicedAmount: 0,
      createdAt: new Date('2024-01-10T09:00:00Z').toISOString(),
      updatedAt: new Date('2024-01-10T09:00:00Z').toISOString(),
    };

    // Create invoice record with multiple detail lines
    const invoiceRecord = {
      invoiceId: 'inv-001',
      dealId: 'deal-001',
      customerId: 'cust-001',
      invoiceDate: new Date('2024-01-15T10:00:00Z').toISOString(),
      status: '発行済み',
      totalAmount: 0, // Will be calculated
      invoiceDetails: [
        {
          detailId: 'detail-001',
          itemName: '品目A',
          unitPrice: 10000,
          quantity: 2,
          lineAmount: 20000,
        },
        {
          detailId: 'detail-002',
          itemName: '品目B',
          unitPrice: 5000,
          quantity: 3,
          lineAmount: 15000,
        },
        {
          detailId: 'detail-003',
          itemName: '品目C',
          unitPrice: 3000,
          quantity: 1,
          lineAmount: 3000,
        },
      ],
    };

    // Calculate expected total: (10,000 × 2) + (5,000 × 3) + (3,000 × 1) = 49,000
    const expectedTotalAmount = 49000;

    // Act: Call the reconciliation function
    const result = await reconcileDealStatusAndInvoiceData(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter
    );

    // Assert: Verify invoice total amount is correctly calculated
    expect(result.invoiceRecord.totalAmount).toBe(expectedTotalAmount);

    // Assert: Verify deal invoiced amount matches invoice total
    expect(result.dealRecord.invoicedAmount).toBe(expectedTotalAmount);

    // Assert: Verify reconciliation status indicates match
    expect(result.reconciliationStatus).toBe('aligned');

    // Assert: Verify deal status remains "受注"
    expect(result.dealRecord.status).toBe('受注');

    // Assert: Verify invoice status is "発行済み"
    expect(result.invoiceRecord.status).toBe('発行済み');

    // Assert: Verify the detail count in response
    expect(result.invoiceRecord.invoiceDetails).toHaveLength(3);

    // Assert: Verify document storage adapter was called
    expect(mockDocumentStorageAdapter.generateShareLink).toHaveBeenCalled();

    // Assert: Verify share link is included in result
    expect(result.shareLink).toBeDefined();
    expect(result.shareLink).toContain('https://storage.example.com/share/');
  });
});