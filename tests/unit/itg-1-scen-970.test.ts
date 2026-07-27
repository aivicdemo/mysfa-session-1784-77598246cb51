import { reconcileSalesWithInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-970
  test('売上実績・請求状況照合機能 - 売上実績と請求書の金額が業務上の最大規模（9,999,999,999円等）の場合、桁溢れなく照合される', async () => {
    const customerId = 'TEST_CUST_001';
    const maxAmountYen = 9999999999;
    const salesDate = new Date('2024-01-15T00:00:00Z');
    const invoiceDate = new Date('2024-01-20T00:00:00Z');

    const salesRecord = {
      customerId: customerId,
      amount: maxAmountYen,
      salesDate: salesDate,
      recordId: 'SALES_001',
    };

    const invoiceRecord = {
      customerId: customerId,
      invoiceAmount: maxAmountYen,
      invoiceDate: invoiceDate,
      recordId: 'INV_001',
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC_001',
        fileUrl: 'https://example.com/docs/DOC_001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://example.com/share/abc123',
        expiresAt: new Date('2024-02-15T00:00:00Z'),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const reconciliationResult = await reconcileSalesWithInvoice(
      salesRecord,
      invoiceRecord,
      mockDocumentStorageAdapter
    );

    expect(reconciliationResult.reconciliationStatus).toBe('完了・一致');
    expect(reconciliationResult.salesAmount).toBe(9999999999);
    expect(reconciliationResult.invoiceAmount).toBe(9999999999);
    expect(reconciliationResult.discrepancy).toBe(0);
    expect(reconciliationResult.systemErrors).toEqual([]);
    expect(reconciliationResult.hasOverflowError).toBe(false);
    expect(reconciliationResult.hasRoundingError).toBe(false);
  });
});