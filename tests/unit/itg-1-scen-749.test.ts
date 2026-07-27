import { detectDealInvoiceMismatch } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-749
  test('複数請求書の請求明細合計が商談金額と不一致の場合、ズレが検出される', () => {
    const dealAmount = 100000;
    
    const invoiceA = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      invoiceDetails: [
        {
          detailId: 'DTL-A-001',
          amount: 20000,
        },
        {
          detailId: 'DTL-A-002',
          amount: 20000,
        },
      ],
    };

    const invoiceB = {
      invoiceId: 'INV-002',
      dealId: 'DEAL-001',
      invoiceDetails: [
        {
          detailId: 'DTL-B-001',
          amount: 30000,
        },
        {
          detailId: 'DTL-B-002',
          amount: 20000,
        },
      ],
    };

    const invoices = [invoiceA, invoiceB];

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const result = detectDealInvoiceMismatch({
      dealId: 'DEAL-001',
      dealAmount: dealAmount,
      invoices: invoices,
      documentStorageAdapter: mockDocumentStorageAdapter,
    });

    const expectedTotalInvoiceAmount = 90000;
    const expectedMismatchAmount = dealAmount - expectedTotalInvoiceAmount;

    expect(result.hasMismatch).toBe(true);
    expect(result.mismatchAmount).toBe(10000);
    expect(result.dealAmount).toBe(100000);
    expect(result.totalInvoiceDetailAmount).toBe(90000);
    expect(result.alertMessage).toBe(
      '請求書複数件の明細合計金額が商談金額と不一致です。ズレ金額：10000円'
    );
  });
});