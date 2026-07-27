import { fetchLatestCustomerTransactions } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  test("SCEN-462: 前回のデータ取得時刻が指定されていない場合、再取得トリガーが発火する", () => {
    // 顧客ID
    const customerId = "CUST-001";

    // 前回のデータ取得時刻が null/undefined の状態
    const previousFetchTimestamp = null;

    // データ取得処理のモック
    const mockDataSource = {
      fetchDealHistory: jest.fn().mockReturnValue([
        {
          dealId: "DEAL-0001",
          customerId: customerId,
          dealName: "A社との商談",
          status: "受注",
          amount: 500000,
          createdAt: new Date("2024-01-10T09:00:00Z"),
          updatedAt: new Date("2024-01-15T14:30:00Z"),
        },
        {
          dealId: "DEAL-0002",
          customerId: customerId,
          dealName: "B社との提案",
          status: "交渉中",
          amount: 300000,
          createdAt: new Date("2024-01-12T10:00:00Z"),
          updatedAt: new Date("2024-01-14T11:00:00Z"),
        },
      ]),
      fetchActivityRecords: jest.fn().mockReturnValue([
        {
          activityId: "ACT-0001",
          customerId: customerId,
          dealId: "DEAL-0001",
          activityType: "訪問",
          description: "顧客訪問",
          recordedAt: new Date("2024-01-15T14:00:00Z"),
        },
        {
          activityId: "ACT-0002",
          customerId: customerId,
          dealId: "DEAL-0002",
          activityType: "電話",
          description: "営業電話",
          recordedAt: new Date("2024-01-14T10:30:00Z"),
        },
      ]),
    };

    // 現在時刻を固定値として設定（テスト内での動的値を避けるため）
    const currentTimestamp = new Date("2024-01-15T15:00:00Z");

    // 再取得トリガー発火時のコール
    const result = fetchLatestCustomerTransactions(
      customerId,
      previousFetchTimestamp,
      mockDataSource,
      currentTimestamp
    );

    // データ取得処理が呼び出されたことを確認
    expect(mockDataSource.fetchDealHistory).toHaveBeenCalledWith(customerId);
    expect(mockDataSource.fetchActivityRecords).toHaveBeenCalledWith(customerId);

    // 取得されたデータが返却されることを確認
    expect(result.dealHistory).toHaveLength(2);
    expect(result.dealHistory[0].dealId).toBe("DEAL-0001");
    expect(result.dealHistory[0].dealName).toBe("A社との商談");
    expect(result.dealHistory[0].status).toBe("受注");
    expect(result.dealHistory[0].amount).toBe(500000);

    expect(result.dealHistory[1].dealId).toBe("DEAL-0002");
    expect(result.dealHistory[1].dealName).toBe("B社との提案");
    expect(result.dealHistory[1].status).toBe("交渉中");
    expect(result.dealHistory[1].amount).toBe(300000);

    // 活動記録の検証
    expect(result.activityRecords).toHaveLength(2);
    expect(result.activityRecords[0].activityId).toBe("ACT-0001");
    expect(result.activityRecords[0].activityType).toBe("訪問");
    expect(result.activityRecords[0].recordedAt).toEqual(
      new Date("2024-01-15T14:00:00Z")
    );

    expect(result.activityRecords[1].activityId).toBe("ACT-0002");
    expect(result.activityRecords[1].activityType).toBe("電話");
    expect(result.activityRecords[1].recordedAt).toEqual(
      new Date("2024-01-14T10:30:00Z")
    );

    // データ取得完了後、現在時刻がタイムスタンプとして記録されていることを確認
    expect(result.lastFetchTimestamp).toEqual(currentTimestamp);
  });
});