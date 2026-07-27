import { fetchCustomerTransactionHistory } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  test("SCEN-437: キャッシュ有効期限満了前1秒の状態では再取得トリガーが発火しない", async () => {
    // Arrange: キャッシュシステムの初期化とタイムスタンプ設定
    const customerId = "CUST-001";
    const cacheValidityDurationMs = 60000; // 60秒
    const initialTimestampT0 = new Date("2024-01-15T10:00:00Z").getTime();
    const timestampT59 = initialTimestampT0 + 59000; // T + 59秒

    // モック: サーバーからのデータ取得応答
    const mockTransactionData = {
      customerId: customerId,
      dealHistory: [
        {
          dealId: "DEAL-001",
          dealName: "提案営業活動",
          status: "提案中",
          amount: 500000,
          createdAt: "2024-01-10T09:30:00Z",
        },
        {
          dealId: "DEAL-002",
          dealName: "初期接触フォロー",
          status: "初期接触",
          amount: 300000,
          createdAt: "2024-01-08T14:15:00Z",
        },
      ],
      activityRecords: [
        {
          activityId: "ACT-001",
          activityType: "メール",
          description: "提案資料送付",
          timestamp: "2024-01-10T10:00:00Z",
        },
        {
          activityId: "ACT-002",
          activityType: "訪問",
          description: "顧客訪問・要望確認",
          timestamp: "2024-01-09T15:00:00Z",
        },
      ],
      lastFetchedAt: new Date(initialTimestampT0).toISOString(),
      cacheExpiresAt: new Date(initialTimestampT0 + cacheValidityDurationMs).toISOString(),
    };

    // モック関数: サーバーからデータ取得
    let fetchCallCount = 0;
    const mockFetchFromServer = jest
      .fn()
      .mockImplementation(() => {
        fetchCallCount++;
        return Promise.resolve(mockTransactionData);
      });

    // Act 1: 初期キャッシュを生成（T=0）
    const cacheInitialResult = await fetchCustomerTransactionHistory(
      customerId,
      {
        currentTimestamp: initialTimestampT0,
        fetchDataFromServer: mockFetchFromServer,
        cacheValidityMs: cacheValidityDurationMs,
      }
    );

    // Assert 1: 初回取得でサーバーが呼ばれたことを確認
    expect(fetchCallCount).toBe(1);
    expect(cacheInitialResult.source).toBe("server");
    expect(cacheInitialResult.data.dealHistory).toHaveLength(2);
    expect(cacheInitialResult.data.activityRecords).toHaveLength(2);

    // Act 2: キャッシュ有効期限まであと1秒の状態（T + 59秒）で再度呼び出し
    // 再取得トリガー（ユーザー操作なし）が発火するかどうかを確認
    const resultAtT59 = await fetchCustomerTransactionHistory(
      customerId,
      {
        currentTimestamp: timestampT59,
        fetchDataFromServer: mockFetchFromServer,
        cacheValidityMs: cacheValidityDurationMs,
      }
    );

    // Assert 2: T + 59秒の時点ではキャッシュから取得され、サーバーが呼ばれていない
    expect(fetchCallCount).toBe(1); // 初回取得の1回のままで増えていない
    expect(resultAtT59.source).toBe("cache");
    expect(resultAtT59.data.dealHistory).toHaveLength(2);
    expect(resultAtT59.data.activityRecords).toHaveLength(2);

    // Assert 3: キャッシュデータが初回取得時と同じであることを確認
    expect(resultAtT59.data.dealHistory[0].dealId).toBe("DEAL-001");
    expect(resultAtT59.data.activityRecords[0].activityId).toBe("ACT-001");

    // Assert 4: キャッシュの有効期限が設定通りであることを確認
    const cacheExpiryTime = new Date(resultAtT59.cacheExpiresAt).getTime();
    expect(cacheExpiryTime).toBe(initialTimestampT0 + cacheValidityDurationMs);

    // Assert 5: T + 59秒の時点で有効期限までの残り時間が1秒以上であることを確認
    const timeUntilExpiry = cacheExpiryTime - timestampT59;
    expect(timeUntilExpiry).toBeGreaterThan(0);
    expect(timeUntilExpiry).toBeLessThanOrEqual(1000); // 1秒以下かつ正数

    // Assert 6: サーバー呼び出しログに T + 59秒時点での通信がないことを確認
    expect(mockFetchFromServer).toHaveBeenCalledTimes(1); // 初回の1回のみ
  });
});