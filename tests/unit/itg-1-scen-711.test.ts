import { calculateMonthlyDeadlineFromBusinessDay } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-711
  test("月次決算期限が祝日の場合、営業日計算は前営業日から数える", () => {
    const baseDate = new Date("2024-01-08T00:00:00Z"); // 成人の日（祝日・月曜日）
    const holidayDates = [new Date("2024-01-08T00:00:00Z")]; // 祝日マスタ
    const daysToCount = 10;

    const result = calculateMonthlyDeadlineFromBusinessDay(
      baseDate,
      daysToCount,
      holidayDates
    );

    const expectedDate = new Date("2024-01-19T00:00:00Z"); // 2024年1月19日（金曜日）

    expect(result.getTime()).toBe(expectedDate.getTime());
  });
});