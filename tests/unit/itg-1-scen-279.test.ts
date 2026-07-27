import { detectDealInvoiceAlignment } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-279
  test('[edge] 売上計上予定日と実際の請求日が同一のとき、期日ズレが検出されない', () => {
    const dealData = {
      dealId: 'DEAL-20240315-001',
      dealStatus: 'クローズ',
      plannedRevenueDate: new Date('2024-03-15T00:00:00Z'),
      amount: 1000000,
    };

    const invoiceData = {
      invoiceId: 'INV-20240315-001',
      invoiceDate: new Date('2024-03-15T00:00:00Z'),
      amount: 1000000,
      dealId: 'DEAL-20240315-001',
    };

    const result = detectDealInvoiceAlignment(dealData, invoiceData);

    expect(result.hasDateMismatch).toBe(false);
    expect(result.alignmentStatus).toBe('正常');
    expect(result.daysDifference).toBe(0);
    expect(result.showWarning).toBe(false);
    expect(result.showAlert).toBe(false);
    expect(result.mismatchFlag).toBe(false);
  });
});