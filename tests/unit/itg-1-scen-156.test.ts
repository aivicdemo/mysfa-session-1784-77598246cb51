import { validateInvoiceAmountAlignment } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-156
  test('商談金額と請求金額のズレが検出され、警告メッセージが表示される', () => {
    const dealRecord = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      dealAmount: 1000000,
      dealStatus: '受注',
      dealStatusHistory: [
        {
          statusChangeDate: '2024-01-15T10:00:00Z',
          previousStatus: '提案中',
          newStatus: '受注',
        },
      ],
    };

    const invoiceRecord = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      invoiceAmount: 950000,
      invoiceIssuedDate: '2024-01-16T09:00:00Z',
      invoiceStatus: '発行済み',
      invoiceDetails: [
        {
          lineNumber: 1,
          itemName: '商品A',
          quantity: 1,
          unitPrice: 950000,
          lineAmount: 950000,
        },
      ],
    };

    const expectedAmountDifference = dealRecord.dealAmount - invoiceRecord.invoiceAmount;

    const result = validateInvoiceAmountAlignment({
      dealRecord,
      invoiceRecord,
    });

    expect(result).toEqual({
      alignmentStatus: '要確認',
      hasAmountMismatch: true,
      amountDifference: expectedAmountDifference,
      amountDifferencePercentage: (expectedAmountDifference / dealRecord.dealAmount) * 100,
      warningMessage: `金額ズレ：-${Math.abs(expectedAmountDifference).toLocaleString('ja-JP')}円`,
      dealId: 'DEAL-001',
      invoiceId: 'INV-001',
      dealAmount: 1000000,
      invoiceAmount: 950000,
      requiresApprovalReview: true,
    });

    expect(result.alignmentStatus).toBe('要確認');
    expect(result.hasAmountMismatch).toBe(true);
    expect(result.amountDifference).toBe(-50000);
    expect(result.amountDifferencePercentage).toBe(-5);
    expect(result.warningMessage).toBe('金額ズレ：-50,000円');
    expect(result.requiresApprovalReview).toBe(true);
  });
});