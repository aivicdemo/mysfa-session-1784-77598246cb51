import { refreshCustomerRecordCache } from "../../src/logic/it-1";

describe("顧客レコード画面のキャッシュ自動更新機能", () => {
  // SCEN-161
  test("データベース再取得に失敗した場合にエラーが適切に処理される", async () => {
    const fetchMock = require("jest-fetch-mock");
    fetchMock.enableMocks();

    // キャッシュデータ（既存データ）
    const existingCacheData = {
      customerId: "CUST-001",
      customerName: "テスト株式会社",
      lastUpdated: "2024-01-15T10:00:00Z",
      dealHistory: [
        {
          dealId: "DEAL-001",
          dealName: "提案A",
          status: "初期接触",
          amount: 1000000,
          timestamp: "2024-01-10T09:00:00Z",
        },
      ],
      activityHistory: [
        {
          activityId: "ACT-001",
          activityType: "メール",
          description: "初回接触メール送信",
          timestamp: "2024-01-09T14:30:00Z",
        },
      ],
    };

    const cacheExpiryTime = new Date("2024-01-15T11:00:00Z").getTime();
    const currentTime = new Date("2024-01-15T11:05:00Z").getTime();
    const userId = "USER-001";
    const customerId = "CUST-001";

    // データベース取得失敗をシミュレート
    fetchMock.resetMocks();
    fetchMock.mockRejectOnce(new Error("データベース接続エラー"));

    const result = await refreshCustomerRecordCache({
      customerId,
      userId,
      existingCacheData,
      cacheExpiryTime,
      currentTime,
    });

    // エラーがキャッチされている
    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("DB_CONNECTION_FAILED");

    // エラーメッセージが分かりやすい
    expect(result.errorMessage).toMatch(/データベース/);

    // エラーログが記録されている
    expect(result.errorLogged).toBe(true);

    // 既存のキャッシュデータが保持されている
    expect(result.cachedData).toEqual(existingCacheData);

    // システムが継続動作するための情報を返す
    expect(result.shouldContinueWithCache).toBe(true);
  });
});