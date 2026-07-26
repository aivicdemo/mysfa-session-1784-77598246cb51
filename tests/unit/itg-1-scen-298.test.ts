import { approveInvestmentDecision } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-298
  test('投資判断承認ロジック - 回収期間が設定上限を超える場合、投資判定が却下される', () => {
    const investment_proposal = {
      proposal_id: 'INV-2024-001',
      proposal_name: '営業管理システム自社開発',
      investment_amount: 5000000,
      expected_annual_revenue: 1000000,
      payback_period_years: 7,
      payback_period_limit_years: 5,
    };

    expect(() =>
      approveInvestmentDecision(investment_proposal)
    ).toThrow(/回収期間/);
  });
});