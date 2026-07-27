import { fetchDealHistoryAndActivities } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示 - キャッシュ有効期限管理", () => {
  // SCEN-436
  test("キャッシュ有効期限がちょうど満了した瞬間、再取得トリガーが発火する", () => {
    // ============================================================
    // Arrange: テストデータと時刻基準の初期化
    // ============================================================
    const baseTime = new Date("2024-01-15T10:00:00Z");
    const customerId = "CUST-00001";
    const cacheValidityDuration = 300; // 5分（秒）

    // キャッシュ有効期限: baseTime + 300秒 = 2024-01-15T10:05:00Z
    const cacheExpiryTime = new Date(baseTime.getTime() + cacheValidityDuration * 1000);

    // 初回取得時のレスポンスデータ（タイムスタンプA）
    const firstResponseTimestamp = "2024-01-15T10:00:00Z";
    const firstResponseData = {
      dealHistory: [
        {
          dealId: "DEAL-001",
          customerName: "顧客A",
          dealAmount: 1000000,
          dealStatus: "受注",
          dealDate: "2024-01-10T09:00:00Z",
        },
        {
          dealId: "DEAL-002",
          customerName: "顧客A",
          dealAmount: 500000,
          dealStatus: "提案中",
          dealDate: "2024-01-12T14:00:00Z",
        },
        {
          dealId: "DEAL-003",
          customerName: "顧客A",
          dealAmount: 750000,
          dealStatus: "交渉中",
          dealDate: "2024-01-14T11:30:00Z",
        },
      ],
      activities: [
        {
          activityId: "ACT-001",
          type: "訪問",
          date: "2024-01-15T09:30:00Z",
          description: "初回訪問",
        },
      ],
      lastUpdatedAt: firstResponseTimestamp,
    };

    // 2回目取得時のレスポンスデータ（タイムスタンプB、更新されたレコード）
    const secondResponseTimestamp = "2024-01-15T10:05:00Z";
    const secondResponseData = {
      dealHistory: [
        {
          dealId: "DEAL-001",
          customerName: "顧客A",
          dealAmount: 1000000,
          dealStatus: "受注",
          dealDate: "2024-01-10T09:00:00Z",
        },
        {
          dealId: "DEAL-002",
          customerName: "顧客A",
          dealAmount: 500000,
          dealStatus: "受注",
          dealDate: "2024-01-12T14:00:00Z",
        },
        {
          dealId: "DEAL-003",
          customerName: "顧客A",
          dealAmount: 750000,
          dealStatus: "交渉中",
          dealDate: "2024-01-14T11:30:00Z",
        },
        {
          dealId: "DEAL-004",
          customerName: "顧客A",
          dealAmount: 250000,
          dealStatus: "初期接触",
          dealDate: "2024-01-15T10:04:00Z",
        },
      ],
      activities: [
        {
          activityId: "ACT-001",
          type: "訪問",
          date: "2024-01-15T09:30:00Z",
          description: "初回訪問",
        },
        {
          activityId: "ACT-002",
          type: "電話",
          date: "2024-01-15T10:04:30Z",
          description: "進捗確認",
        },
      ],
      lastUpdatedAt: secondResponseTimestamp,
    };

    // システムログを記録するスタブ
    const systemLogs: string[] = [];

    // モック用のデータソース
    const mockDataSource = {
      fetchDealAndActivityRecords: jest
        .fn()
        .mockImplementation((custId: string, currentTime: Date) => {
          // キャッシュが有効な場合は firstResponseData を返す
          if (currentTime < cacheExpiryTime) {
            return Promise.resolve(firstResponseData);
          }
          // キャッシュが無効になった場合は secondResponseData を返す
          systemLogs.push(
            `Cache expired at ${cacheExpiryTime.toISOString()}, triggering data refresh`
          );
          return Promise.resolve(secondResponseData);
        }),
    };

    // ============================================================
    // Act & Assert: ステップごとの検証
    // ============================================================

    // ステップ1: 顧客レコード画面を開き、キャッシュを初期化する
    let cachedData: typeof firstResponseData | null = null;
    let cacheTimestamp: Date | null = null;

    // ステップ2-3: システム時刻をbaseTimeに設定し、初回取得を実行
    return fetchDealHistoryAndActivities(customerId, baseTime, mockDataSource)
      .then((response) => {
        // 初回レスポンスを記録
        cachedData = response;
        cacheTimestamp = baseTime;

        // ステップ3: 初回取得されたデータを確認
        expect(response.dealHistory).toHaveLength(3);
        expect(response.lastUpdatedAt).toBe(firstResponseTimestamp);
        expect(response.dealHistory[0].dealAmount).toBe(1000000);

        // ステップ4: システム時刻をT0 + 299秒に進める（キャッシュまだ有効）
        const timeT0Plus299 = new Date(baseTime.getTime() + 299 * 1000);

        // ステップ5: キャッシュが有効な状態で再度要求
        return fetchDealHistoryAndActivities(
          customerId,
          timeT0Plus299,
          mockDataSource
        );
      })
      .then((response) => {
        // ステップ6: キャッシュが有効であることを確認
        // 前回と同じレスポンスデータが返されることを確認
        expect(response.dealHistory).toHaveLength(3);
        expect(response.lastUpdatedAt).toBe(firstResponseTimestamp);
        expect(response.dealHistory[0].dealAmount).toBe(1000000);
        expect(response.dealHistory[1].dealAmount).toBe(500000);
        expect(response.dealHistory[2].dealAmount).toBe(750000);

        // ステップ7: システム時刻をT0 + 300秒に進める
        // (キャッシュ有効期限がちょうど満了した瞬間)
        const timeT0Plus300 = new Date(
          baseTime.getTime() + cacheValidityDuration * 1000
        );

        // ステップ8: キャッシュ有効期限がちょうど満了した瞬間に再度要求
        return fetchDealHistoryAndActivities(
          customerId,
          timeT0Plus300,
          mockDataSource
        );
      })
      .then((response) => {
        // ステップ9: システムログにキャッシュ再取得イベントが記録されたことを確認
        expect(systemLogs).toContain(
          `Cache expired at ${cacheExpiryTime.toISOString()}, triggering data refresh`
        );

        // ステップ10: 新しいレスポンスデータが返されたことを確認
        // 新しいタイムスタンプBが返される
        expect(response.lastUpdatedAt).toBe(secondResponseTimestamp);

        // 更新されたレコード（4件目の商談が新規追加）が含まれる
        expect(response.dealHistory).toHaveLength(4);
        expect(response.dealHistory[3].dealId).toBe("DEAL-004");
        expect(response.dealHistory[3].dealAmount).toBe(250000);

        // 新規活動レコードが追加されている
        expect(response.activities).toHaveLength(2);
        expect(response.activities[1].activityId).toBe("ACT-002");
        expect(response.activities[1].type).toBe("電話");

        // 既存レコードのステータスが更新されている
        expect(response.dealHistory[1].dealStatus).toBe("受注");
      });
  });
});