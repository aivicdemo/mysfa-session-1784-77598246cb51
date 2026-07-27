import { generateMonthlyAccountingReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-315
  test('月次決算レポート生成機能 - 商談ステータスが「提案中」のレコードは集計対象から除外される', () => {
    // Arrange
    const dealRecords = [
      {
        dealId: 'DEAL_A',
        dealName: '商談A',
        status: '提案中',
        amount: 1000000,
        assignedSalesRep: '営業太郎',
        dealDate: '2024-01-15',
      },
      {
        dealId: 'DEAL_B',
        dealName: '商談B',
        status: '受注',
        amount: 2000000,
        assignedSalesRep: '営業太郎',
        dealDate: '2024-01-10',
      },
      {
        dealId: 'DEAL_C',
        dealName: '商談C',
        status: '提案中',
        amount: 1500000,
        assignedSalesRep: '営業花子',
        dealDate: '2024-01-20',
      },
      {
        dealId: 'DEAL_D',
        dealName: '商談D',
        status: '失注',
        amount: 500000,
        assignedSalesRep: '営業花子',
        dealDate: '2024-01-05',
      },
    ];

    const reportParams = {
      targetMonth: '2024-01',
      dealRecords,
    };

    // Act
    const report = generateMonthlyAccountingReport(reportParams);

    // Assert
    // 集計対象商談一覧は『受注』ステータスの商談Bのみ
    expect(report.aggregatedDealsList).toHaveLength(1);
    expect(report.aggregatedDealsList[0]).toEqual({
      dealId: 'DEAL_B',
      dealName: '商談B',
      status: '受注',
      amount: 2000000,
      assignedSalesRep: '営業太郎',
      dealDate: '2024-01-10',
    });

    // 月間売上合計は200万円
    expect(report.monthlySalesTotal).toBe(2000000);

    // 売上集計サマリー
    expect(report.salesSummary).toEqual({
      targetMonth: '2024-01',
      closedDealsCount: 1,
      totalRevenue: 2000000,
      excludedProposalCount: 2, // 商談A、商談C
      excludedLostCount: 1, // 商談D
    });

    // 除外されたレコードの詳細確認
    expect(report.excludedDealsList).toHaveLength(3);
    const excludedProposals = report.excludedDealsList.filter(
      (deal) => deal.status === '提案中'
    );
    expect(excludedProposals).toHaveLength(2);
    expect(excludedProposals.map((d) => d.dealId)).toEqual(['DEAL_A', 'DEAL_C']);

    const excludedLost = report.excludedDealsList.filter(
      (deal) => deal.status === '失注'
    );
    expect(excludedLost).toHaveLength(1);
    expect(excludedLost[0].dealId).toBe('DEAL_D');
  });
});