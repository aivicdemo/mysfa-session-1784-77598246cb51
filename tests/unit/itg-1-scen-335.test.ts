import { generateMonthlyReport } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-335
  test("月次決算レポート生成機能 - 対象期間終了日時が空（null）のとき、エラーが発生する", () => {
    const startDateTime = new Date("2024-01-01T00:00:00Z");
    const endDateTime = null;

    expect(() => {
      generateMonthlyReport({
        startDateTime,
        endDateTime,
      });
    }).toThrow(/対象期間終了日時/);
  });
});