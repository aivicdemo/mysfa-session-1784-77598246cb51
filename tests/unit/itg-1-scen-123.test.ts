import { generateMonthlyReportForm } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-123
  test("月次営業成績報告書生成機能 - 必須項目の一部が不足している場合、エラーが発生する", () => {
    const incomplete_report_input = {
      salesperson_name: "田中太郎",
      sales_amount: null,
      report_period_start: "2024-01-01",
      report_period_end: "2024-01-31",
      report_date: "2024-02-01",
      department: "営業部",
    };

    expect(() => generateMonthlyReportForm(incomplete_report_input)).toThrow(
      /売上金額/
    );
  });
});