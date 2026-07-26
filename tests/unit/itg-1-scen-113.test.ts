import { determineExtractionPeriod } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-113
  test("抽出対象期間自動決定機能 - システム日時が取得不可の場合、エラーが発生する", () => {
    const mockGetSystemDateTime = jest.fn(() => null);

    expect(() => {
      determineExtractionPeriod(mockGetSystemDateTime);
    }).toThrow(/システム日時/);
  });
});