import { generateMonthlySalesReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-123: [normal] 月次営業成績報告書生成機能 - 統一フォーマットの報告書に売上・件数・進捗率が記載される
  test('月次営業成績報告書が統一フォーマットで生成され、売上・件数・進捗率がすべて正確に記載される', () => {
    const reportMonth = '2024-04';
    const departmentId = 'dept_001';
    const userId = 'user_123';

    const dealData = [
      {
        dealId: 'deal_001',
        customerId: 'cust_001',
        status: '受注',
        amount: 1000000,
        closedDate: '2024-04-10',
      },
      {
        dealId: 'deal_002',
        customerId: 'cust_002',
        status: '受注',
        amount: 500000,
        closedDate: '2024-04-15',
      },
      {
        dealId: 'deal_003',
        customerId: 'cust_003',
        status: '提案中',
        amount: 300000,
        closedDate: null,
      },
      {
        dealId: 'deal_004',
        customerId: 'cust_004',
        status: '初期接触',
        amount: 200000,
        closedDate: null,
      },
    ];

    const expectedTotalRevenue = 1500000;
    const expectedClosedCount = 2;
    const expectedProposalCount = 4;
    const expectedProgressRate = (2 / 4) * 100;

    const report = generateMonthlySalesReport({
      reportMonth,
      departmentId,
      userId,
      dealData,
    });

    expect(report).toBeDefined();
    expect(report.reportMonth).toBe(reportMonth);
    expect(report.departmentId).toBe(departmentId);
    expect(report.format).toBe('統一フォーマット');
    expect(report.sales.totalRevenue).toBe(expectedTotalRevenue);
    expect(report.sales.closedDealsCount).toBe(expectedClosedCount);
    expect(report.sales.proposalCount).toBe(expectedProposalCount);
    expect(report.sales.progressRate).toBe(expectedProgressRate);
    expect(report.generatedAt).toBeDefined();
    expect(typeof report.generatedAt).toBe('string');
  });
});