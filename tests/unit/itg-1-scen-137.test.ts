import { aggregateMonthlySalesAndBillingStatus } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-137
  test('[normal] 売上実績・請求状況の月次集計機能 - 指定期間内の全商談から売上実績・請求金額・未請求額が正確に集計される', () => {
    const aggregationPeriodStart = new Date('2024-01-01');
    const aggregationPeriodEnd = new Date('2024-01-31');

    const dealData = [
      {
        dealId: 'DEAL001',
        customerId: 'CUST001',
        dealStatus: '受注',
        salesAmount: 1000000,
        billedAmount: 800000,
        unbilledAmount: 200000,
        dealDate: new Date('2024-01-05'),
      },
      {
        dealId: 'DEAL002',
        customerId: 'CUST002',
        dealStatus: '受注',
        salesAmount: 500000,
        billedAmount: 500000,
        unbilledAmount: 0,
        dealDate: new Date('2024-01-15'),
      },
      {
        dealId: 'DEAL003',
        customerId: 'CUST001',
        dealStatus: '完了',
        salesAmount: 750000,
        billedAmount: 750000,
        unbilledAmount: 0,
        dealDate: new Date('2024-01-20'),
      },
    ];

    const result = aggregateMonthlySalesAndBillingStatus({
      periodStart: aggregationPeriodStart,
      periodEnd: aggregationPeriodEnd,
      deals: dealData,
    });

    const expectedTotalSalesAmount = 2250000;
    const expectedTotalBilledAmount = 2050000;
    const expectedTotalUnbilledAmount = 200000;

    expect(result.totalSalesAmount).toBe(expectedTotalSalesAmount);
    expect(result.totalBilledAmount).toBe(expectedTotalBilledAmount);
    expect(result.totalUnbilledAmount).toBe(expectedTotalUnbilledAmount);
    expect(result.totalSalesAmount).toBe(
      result.totalBilledAmount + result.totalUnbilledAmount
    );
    expect(result.dealCount).toBe(3);
    expect(result.aggregationPeriodStart).toEqual(aggregationPeriodStart);
    expect(result.aggregationPeriodEnd).toEqual(aggregationPeriodEnd);
  });
});