import { fetchDealHistoryAndActivities } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  // SCEN-463
  test("前回のデータ取得時刻が空文字列の場合、エラーが発生する", () => {
    const mockStorageAdapter = {
      getLastFetchTime: jest.fn(() => ""),
    };

    expect(() =>
      fetchDealHistoryAndActivities(
        "CUST-12345",
        mockStorageAdapter
      )
    ).toThrow(/データ取得時刻/);
  });
});