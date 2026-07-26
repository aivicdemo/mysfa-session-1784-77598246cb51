import { isMonthlyReportDeadlineReached } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-108
  test("月次報告期限判定機能 - 現在日時が月次報告期限と正確に同一時刻の場合に期限到達フラグがtrueとなる", () => {
    const deadline = new Date("2024-04-30T23:59:59Z");
    const currentTime = new Date("2024-04-30T23:59:59Z");

    const result = isMonthlyReportDeadlineReached({
      deadline,
      currentTime,
    });

    expect(result).toBe(true);
  });
});