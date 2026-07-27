import { generateMonthlyRevenueReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-313: 月次決算レポート生成機能 - 対象期間内の複数商談の金額が売上実績に正確に集計される', () => {
    // Arrange
    const targetStartDate = new Date('2024-01-01T00:00:00Z');
    const targetEndDate = new Date('2024-01-31T23:59:59Z');

    const dealRecords = [
      {
        dealId: 'DEAL001',
        customerId: 'CUST001',
        amount: 500000,
        status: '成約',
        closedDate: new Date('2024-01-15T10:00:00Z'),
      },
      {
        dealId: 'DEAL002',
        customerId: 'CUST002',
        amount: 750000,
        status: '成約',
        closedDate: new Date('2024-01-20T14:30:00Z'),
      },
      {
        dealId: 'DEAL003',
        customerId: 'CUST003',
        amount: 1200000,
        status: '成約',
        closedDate: new Date('2024-01-25T09:15:00Z'),
      },
    ];

    // Act
    const report = generateMonthlyRevenueReport({
      dealRecords: dealRecords,
      periodStartDate: targetStartDate,
      periodEndDate: targetEndDate,
    });

    // Assert
    const expectedTotalRevenue = 2450000;
    expect(report.totalRevenue).toBe(expectedTotalRevenue);
    expect(report.dealCount).toBe(3);
    expect(Number.isInteger(report.totalRevenue)).toBe(true);
  });
});