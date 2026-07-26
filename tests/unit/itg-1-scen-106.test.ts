import { checkMonthlyReportDeadline } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-106
  test("月次報告期限判定機能 - 現在日時が月次報告期限前の場合に期限到達フラグがfalseとなる", () => {
    const deadline = new Date("2024-04-30T23:59:59Z");
    const currentDate = new Date("2024-04-29T10:00:00Z");

    const result = checkMonthlyReportDeadline({
      deadline,
      currentDate,
    });

    expect(result.isDeadlineReached).toBe(false);
  });
});