import { determinePeriodForMonthlyReport } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-111
  test("抽出対象期間自動決定機能 - 月次報告期限到達確認後、当月の1日から末日までが抽出対象期間として自動決定される", () => {
    const current_date = new Date("2024-04-15T10:30:00Z");
    const monthly_deadline = new Date("2024-04-30T23:59:59Z");

    const result = determinePeriodForMonthlyReport({
      current_date,
      monthly_deadline,
    });

    const expected_start_date = new Date("2024-04-01T00:00:00Z");
    const expected_end_date = new Date("2024-04-30T23:59:59Z");
    const expected_period_days = 30;

    expect(result.period_start).toEqual(expected_start_date);
    expect(result.period_end).toEqual(expected_end_date);
    expect(result.period_days).toBe(expected_period_days);

    const actual_days =
      Math.floor(
        (result.period_end.getTime() - result.period_start.getTime()) /
          (24 * 60 * 60 * 1000)
      ) + 1;
    expect(actual_days).toBe(expected_period_days);
  });
});