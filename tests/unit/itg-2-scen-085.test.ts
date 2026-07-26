import { detectUnbilledAndDelayedDeals } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 売上計上予定日と請求日のズレ検出機能', () => {
  // SCEN-085
  test('商談ステータス「受注」で売上計上予定日と請求書発行日が一致する場合、未請求案件リストに含まれない', () => {
    const dealData = {
      dealId: 'DEAL-001',
      status: '受注',
      estimatedRevenueDate: new Date('2024-01-15T00:00:00Z'),
      invoiceIssuedDate: new Date('2024-01-15T00:00:00Z'),
      customerId: 'CUST-001',
      dealAmount: 1000000,
    };

    const result = detectUnbilledAndDelayedDeals([dealData]);

    expect(result.unbilledDeals).toEqual([]);
    expect(result.delayedDeals).toEqual([]);
    expect(result.matchedDeals).toHaveLength(1);
    expect(result.matchedDeals[0]).toEqual({
      dealId: 'DEAL-001',
      status: '受注',
      estimatedRevenueDate: new Date('2024-01-15T00:00:00Z'),
      invoiceIssuedDate: new Date('2024-01-15T00:00:00Z'),
      customerId: 'CUST-001',
      dealAmount: 1000000,
    });
  });
});