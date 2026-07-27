import { calculateMonthlyProgressRate } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-136
  test("[error] 当月進捗率計算機能 - 提案数が0件のときZeroDivisionExceptionが発生する", () => {
    const monthly_sales_data = {
      sales_rep_id: "REP-001",
      contracted_count: 0,
      proposal_count: 0,
      target_amount: 1000000,
      actual_amount: 0,
    };

    expect(() => calculateMonthlyProgressRate(monthly_sales_data)).toThrow(
      /提案数/
    );
  });
});