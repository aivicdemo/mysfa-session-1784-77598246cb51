import { determineExtractionPeriod } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-112
  test("抽出対象期間自動決定機能 - 営業担当者のアクセス権が存在しない場合にエラーが発生する", () => {
    const sales_person_id = "SP-99999";
    const current_date = new Date("2024-04-15T10:00:00Z");

    expect(() =>
      determineExtractionPeriod({
        sales_person_id,
        current_date,
      })
    ).toThrow(/アクセス権/);
  });
});