import { fetchCustomerHistoryWithCache } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-158
  test("キャッシュ有効期限内の場合キャッシュされたデータが返される", async () => {
    const fetchMock = require("jest-fetch-mock");
    fetchMock.enableMocks();
    fetchMock.resetMocks();

    const customerId = "CUST_20240415001";
    const cacheValidityMinutes = 5;
    const firstFetchTimestamp = new Date("2024-04-15T10:00:00Z");
    const secondFetchTimestamp = new Date("2024-04-15T10:03:00Z");

    const mockCustomerData = {
      customer_id: customerId,
      customer_name: "テスト顧客A株式会社",
      industry: "製造業",
      establishment_date: "2010-05-20",
    };

    const mockDealHistory = [
      {
        deal_id: "DEAL_20240401001",
        deal_name: "システム導入案件",
        status: "受注",
        amount: 5000000,
        deal_date: "2024-04-01",
      },
      {
        deal_id: "DEAL_20240310001",
        deal_name: "保守契約更新",
        status: "完了",
        amount: 500000,
        deal_date: "2024-03-10",
      },
    ];

    const mockActivityRecords = [
      {
        activity_id: "ACT_20240410001",
        activity_type: "訪問",
        activity_date: "2024-04-10T14:30:00Z",
        description: "営業成績確認ミーティング",
        participant: "営業太郎",
      },
      {
        activity_id: "ACT_20240405001",
        activity_type: "電話",
        activity_date: "2024-04-05T09:15:00Z",
        description: "導入スケジュール確認",
        participant: "営業太郎",
      },
    ];

    const mockIssueRecords = [
      {
        issue_id: "ISS_20240401001",
        issue_title: "導入環境構築遅延",
        status: "解決済み",
        resolution_date: "2024-04-08T16:45:00Z",
      },
    ];

    const expectedFirstResponse = {
      customer: mockCustomerData,
      deal_history: mockDealHistory,
      activity_records: mockActivityRecords,
      issue_records: mockIssueRecords,
      record_count: 4,
      fetch_timestamp: "2024-04-15T10:00:00Z",
      cache_valid_until: "2024-04-15T10:05:00Z",
    };

    fetchMock.mockResponseOnce(JSON.stringify(expectedFirstResponse), {
      status: 200,
    });

    const firstResult = await fetchCustomerHistoryWithCache({
      customer_id: customerId,
      current_timestamp: firstFetchTimestamp,
      cache_validity_minutes: cacheValidityMinutes,
    });

    expect(firstResult).toEqual(expectedFirstResponse);
    expect(firstResult.customer.customer_id).toBe(customerId);
    expect(firstResult.deal_history).toHaveLength(2);
    expect(firstResult.activity_records).toHaveLength(2);
    expect(firstResult.issue_records).toHaveLength(1);
    expect(firstResult.record_count).toBe(4);
    expect(firstResult.cache_valid_until).toBe("2024-04-15T10:05:00Z");

    const firstFetchCallCount = fetchMock.mock.calls.length;
    expect(firstFetchCallCount).toBe(1);

    const secondResult = await fetchCustomerHistoryWithCache({
      customer_id: customerId,
      current_timestamp: secondFetchTimestamp,
      cache_validity_minutes: cacheValidityMinutes,
    });

    expect(secondResult).toEqual(expectedFirstResponse);
    expect(secondResult.customer.customer_id).toBe(customerId);
    expect(secondResult.deal_history).toHaveLength(2);
    expect(secondResult.activity_records).toHaveLength(2);
    expect(secondResult.issue_records).toHaveLength(1);
    expect(secondResult.record_count).toBe(4);
    expect(secondResult.cache_valid_until).toBe("2024-04-15T10:05:00Z");

    const secondFetchCallCount = fetchMock.mock.calls.length;
    expect(secondFetchCallCount).toBe(1);

    expect(secondResult).toBe(firstResult);
    expect(secondResult.fetch_timestamp).toBe(firstResult.fetch_timestamp);
    expect(secondResult.deal_history[0].deal_id).toBe(
      firstResult.deal_history[0].deal_id
    );
    expect(secondResult.activity_records[0].activity_id).toBe(
      firstResult.activity_records[0].activity_id
    );
    expect(secondResult.issue_records[0].issue_id).toBe(
      firstResult.issue_records[0].issue_id
    );

    fetchMock.disableMocks();
  });
});