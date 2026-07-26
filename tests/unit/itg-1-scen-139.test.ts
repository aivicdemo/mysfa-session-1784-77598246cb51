import { aggregateMonthlySalesAndBilling } from '../../src/logic/it-1-3';

describe('売上実績・請求状況の月次集計機能', () => {
  // SCEN-139: [edge] 売上実績・請求状況の月次集計機能 - 集計対象期間の開始日と終了日の境界値における商談が正確に含まれる
  test('should accurately include deals on start and end date boundaries during monthly aggregation', () => {
    const aggregationStartDate = new Date('2024-01-01T00:00:00Z');
    const aggregationEndDate = new Date('2024-01-31T23:59:59Z');

    const deals = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-001',
        status: 'completed',
        amount: 100000,
        createdAt: new Date('2024-01-01T00:00:00Z'),
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-002',
        status: 'completed',
        amount: 250000,
        createdAt: new Date('2024-01-31T23:59:59Z'),
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-003',
        status: 'completed',
        amount: 150000,
        createdAt: new Date('2023-12-31T23:59:59Z'),
      },
      {
        dealId: 'DEAL-004',
        customerId: 'CUST-004',
        status: 'completed',
        amount: 200000,
        createdAt: new Date('2024-02-01T00:00:00Z'),
      },
    ];

    const result = aggregateMonthlySalesAndBilling({
      deals: deals,
      startDate: aggregationStartDate,
      endDate: aggregationEndDate,
    });

    expect(result.includedDealsCount).toBe(2);
    expect(result.totalSalesAmount).toBe(350000);
    expect(result.includedDealIds).toEqual(['DEAL-001', 'DEAL-002']);
    expect(result.excludedDealIds).toEqual(['DEAL-003', 'DEAL-004']);

    const includedDealDetails = result.dealDetails.filter(
      (detail) => detail.isIncluded === true
    );
    expect(includedDealDetails).toHaveLength(2);

    const deal001Detail = includedDealDetails.find(
      (d) => d.dealId === 'DEAL-001'
    );
    expect(deal001Detail).toBeDefined();
    expect(deal001Detail?.amount).toBe(100000);
    expect(deal001Detail?.createdAt).toEqual(
      new Date('2024-01-01T00:00:00Z')
    );

    const deal002Detail = includedDealDetails.find(
      (d) => d.dealId === 'DEAL-002'
    );
    expect(deal002Detail).toBeDefined();
    expect(deal002Detail?.amount).toBe(250000);
    expect(deal002Detail?.createdAt).toEqual(
      new Date('2024-01-31T23:59:59Z')
    );

    const excludedDealDetails = result.dealDetails.filter(
      (detail) => detail.isIncluded === false
    );
    expect(excludedDealDetails).toHaveLength(2);

    const deal003Detail = excludedDealDetails.find(
      (d) => d.dealId === 'DEAL-003'
    );
    expect(deal003Detail).toBeDefined();
    expect(deal003Detail?.reason).toMatch(/before/i);

    const deal004Detail = excludedDealDetails.find(
      (d) => d.dealId === 'DEAL-004'
    );
    expect(deal004Detail).toBeDefined();
    expect(deal004Detail?.reason).toMatch(/after/i);
  });
});