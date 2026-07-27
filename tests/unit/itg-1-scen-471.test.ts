import { fetchCustomerActivityHistory } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  test("SCEN-471: 月末日の活動記録が含まれているとき、正しく返される", async () => {
    const customerId = "CUST-001";
    const monthEndTimestamp = new Date("2024-01-31T23:59:59Z");

    const mockActivityRecords = [
      {
        activityId: "ACT-001",
        customerId,
        activityType: "phone",
        activityDescription: "顧客への架電確認",
        timestamp: new Date("2024-01-31T23:30:00Z"),
      },
      {
        activityId: "ACT-002",
        customerId,
        activityType: "email",
        activityDescription: "提案資料の送付",
        timestamp: new Date("2024-01-31T23:45:00Z"),
      },
      {
        activityId: "ACT-003",
        customerId,
        activityType: "meeting",
        activityDescription: "営業担当者との面談実施",
        timestamp: new Date("2024-01-31T23:59:59Z"),
      },
    ];

    const result = await fetchCustomerActivityHistory({
      customerId,
      filterType: undefined,
      sortOrder: "desc",
    });

    expect(result.activities).toHaveLength(3);

    expect(result.activities[0]).toEqual({
      activityId: "ACT-003",
      customerId,
      activityType: "meeting",
      activityDescription: "営業担当者との面談実施",
      timestamp: monthEndTimestamp,
    });

    expect(result.activities[1]).toEqual({
      activityId: "ACT-002",
      customerId,
      activityType: "email",
      activityDescription: "提案資料の送付",
      timestamp: new Date("2024-01-31T23:45:00Z"),
    });

    expect(result.activities[2]).toEqual({
      activityId: "ACT-001",
      customerId,
      activityType: "phone",
      activityDescription: "顧客への架電確認",
      timestamp: new Date("2024-01-31T23:30:00Z"),
    });

    const timestamps = result.activities.map((a) => new Date(a.timestamp).getTime());
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i] <= timestamps[i - 1]).toBe(true);
    }
  });
});