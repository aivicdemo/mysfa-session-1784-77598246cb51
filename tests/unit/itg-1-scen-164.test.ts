import { searchCustomersByAuthorization } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-164
  test("営業権限による顧客検索フィルタリング機能 - 検索条件に該当する担当顧客が存在しない場合に空の結果セットが返される", async () => {
    const fetchMock = require("jest-fetch-mock");
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const userId = "user_001";
    const searchCondition = {
      region: "北海道",
      industry: "IT",
      salesRange: {
        min: 10000000,
        max: 50000000,
      },
    };

    fetchMock.mockResponseOnce(
      JSON.stringify({
        status: 200,
        data: [],
        message: "該当する顧客がありません",
      }),
      { status: 200 }
    );

    const result = await searchCustomersByAuthorization(userId, searchCondition);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/customers/search"),
      expect.objectContaining({
        method: "POST",
      })
    );

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);

    fetchMock.disableMocks();
  });
});