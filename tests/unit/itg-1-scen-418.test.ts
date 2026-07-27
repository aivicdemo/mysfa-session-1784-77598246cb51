import { filterActivityRecordsByType } from "../../src/logic/it-1";

describe("顧客レコード画面の過去商談履歴・活動記録表示機能", () => {
  // SCEN-418
  test("活動記録フィルタリング機能 - フィルタ対象の活動記録が時系列で昇順に返される", () => {
    const testActivities = [
      {
        id: "act_001",
        customerId: "cust_123",
        activityType: "email",
        timestamp: new Date("2024-01-15T10:30:00Z"),
        salesRepId: "rep_001",
        description: "Follow-up email sent",
      },
      {
        id: "act_002",
        customerId: "cust_123",
        activityType: "phone",
        timestamp: new Date("2024-01-15T09:00:00Z"),
        salesRepId: "rep_001",
        description: "Phone call discussion",
      },
      {
        id: "act_003",
        customerId: "cust_123",
        activityType: "visit",
        timestamp: new Date("2024-01-16T14:20:00Z"),
        salesRepId: "rep_001",
        description: "Customer site visit",
      },
      {
        id: "act_004",
        customerId: "cust_123",
        activityType: "email",
        timestamp: new Date("2024-01-14T16:45:00Z"),
        salesRepId: "rep_001",
        description: "Initial contact email",
      },
      {
        id: "act_005",
        customerId: "cust_123",
        activityType: "visit",
        timestamp: new Date("2024-01-16T08:15:00Z"),
        salesRepId: "rep_001",
        description: "Follow-up visit",
      },
    ];

    const filterCriteria = {
      customerId: "cust_123",
      activityType: "email",
      salesRepId: "rep_001",
    };

    const result = filterActivityRecordsByType(testActivities, filterCriteria);

    expect(result).toEqual([
      {
        id: "act_004",
        customerId: "cust_123",
        activityType: "email",
        timestamp: new Date("2024-01-14T16:45:00Z"),
        salesRepId: "rep_001",
        description: "Initial contact email",
      },
      {
        id: "act_001",
        customerId: "cust_123",
        activityType: "email",
        timestamp: new Date("2024-01-15T10:30:00Z"),
        salesRepId: "rep_001",
        description: "Follow-up email sent",
      },
    ]);

    const timestamps = result.map((activity) => activity.timestamp.getTime());
    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i + 1]);
    }
  });
});