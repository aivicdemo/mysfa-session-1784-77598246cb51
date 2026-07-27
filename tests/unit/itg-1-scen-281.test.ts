import { detectDealInvoiceDateMismatch } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-281
  test('[normal] 売上計上予定日が実際の請求日より後のとき、期日ズレが検出される', () => {
    const dealData = {
      dealId: 'DEAL-001',
      customerName: '顧客A',
      dealStatus: '成約',
      recognizedRevenueDate: new Date('2024-03-31T00:00:00Z'),
    };

    const invoiceData = {
      invoiceId: 'INV-001',
      invoiceDate: new Date('2024-03-15T00:00:00Z'),
      invoiceAmount: 1000000,
    };

    const result = detectDealInvoiceDateMismatch(dealData, invoiceData);

    expect(result.hasMismatch).toBe(true);
    expect(result.mismatchDays).toBe(16);
    expect(result.dealId).toBe('DEAL-001');
    expect(result.customerName).toBe('顧客A');
    expect(result.recognizedRevenueDate).toEqual(new Date('2024-03-31T00:00:00Z'));
    expect(result.invoiceDate).toEqual(new Date('2024-03-15T00:00:00Z'));
    expect(result.mismatchDescription).toBe(
      '売上計上予定日（2024年3月31日）が請求日（2024年3月15日）より16日後ろにズレている'
    );
    expect(result.warningLevel).toBe('期日ズレ警告');
  });
});