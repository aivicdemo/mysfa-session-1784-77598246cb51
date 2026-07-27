import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-329: 月次決算レポート生成機能 - 対象期間内の同一顧客の商談が複数件存在するとき、すべてが集計に含まれる', () => {
    const targetStartDate = new Date('2024-01-01T00:00:00Z');
    const targetEndDate = new Date('2024-01-31T23:59:59Z');

    const dealA1 = {
      dealId: 'DEAL001',
      customerId: 'CUST_A',
      customerName: '顧客A',
      dealDate: new Date('2024-01-05T10:00:00Z'),
      amount: 100000,
      status: '完了',
      currency: 'JPY',
    };

    const dealA2 = {
      dealId: 'DEAL002',
      customerId: 'CUST_A',
      customerName: '顧客A',
      dealDate: new Date('2024-01-15T14:30:00Z'),
      amount: 150000,
      status: '完了',
      currency: 'JPY',
    };

    const dealA3 = {
      dealId: 'DEAL003',
      customerId: 'CUST_A',
      customerName: '顧客A',
      dealDate: new Date('2024-01-28T09:15:00Z'),
      amount: 75000,
      status: '完了',
      currency: 'JPY',
    };

    const dealsInPeriod = [dealA1, dealA2, dealA3];

    const report = generateMonthlySettlementReport(
      dealsInPeriod,
      targetStartDate,
      targetEndDate
    );

    expect(report.reportPeriodStart).toEqual(new Date('2024-01-01T00:00:00Z'));
    expect(report.reportPeriodEnd).toEqual(new Date('2024-01-31T23:59:59Z'));
    expect(report.customerSummaries).toHaveLength(1);

    const customerASummary = report.customerSummaries[0];
    expect(customerASummary.customerId).toBe('CUST_A');
    expect(customerASummary.customerName).toBe('顧客A');
    expect(customerASummary.dealCount).toBe(3);
    expect(customerASummary.totalAmount).toBe(325000);

    expect(report.deals).toHaveLength(3);
    expect(report.deals[0].dealId).toBe('DEAL001');
    expect(report.deals[1].dealId).toBe('DEAL002');
    expect(report.deals[2].dealId).toBe('DEAL003');

    expect(report.totalRevenue).toBe(325000);
    expect(report.totalCompletedDeals).toBe(3);
  });
});