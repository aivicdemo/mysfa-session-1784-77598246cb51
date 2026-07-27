import { detectRevenueDateDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-310
  test('売上計上予定日が不在のとき、期日ズレ検出がスキップされる', () => {
    const dealRecord = {
      dealId: 'DEAL-310',
      dealName: 'テスト商談-310',
      customerName: 'テスト顧客A',
      amount: 500000,
      status: '提案中',
      plannedRevenueDate: undefined,
      invoiceIssuedDate: new Date('2024-01-15T11:00:00Z'),
    };

    const result = detectRevenueDateDiscrepancy(dealRecord);

    expect(result).toEqual({
      isSkipped: true,
      discrepancyDetected: false,
      reason: '売上計上予定日',
      affectedDeal: 'DEAL-310',
    });
  });
});