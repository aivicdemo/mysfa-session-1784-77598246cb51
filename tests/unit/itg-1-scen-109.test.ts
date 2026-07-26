import { determineExtractionPeriod } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-109
  test("抽出対象期間自動決定機能 - 月次報告期限到達確認後に当月1日から期限到達日までの期間が自動決定される", () => {
    const current_date = new Date("2024-04-15T10:30:00Z");
    const monthly_report_deadline = new Date("2024-04-15T23:59:59Z");

    const result = determineExtractionPeriod({
      current_date: current_date,
      monthly_report_deadline: monthly_report_deadline,
    });

    const expected_period_start = new Date("2024-04-01T00:00:00Z");
    const expected_period_end = new Date("2024-04-15T23:59:59Z");

    expect(result.period_start).toEqual(expected_period_start);
    expect(result.period_end).toEqual(expected_period_end);
    expect(result.is_extraction_period_determined).toBe(true);
  });
});