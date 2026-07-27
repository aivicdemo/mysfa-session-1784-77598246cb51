import { fetchDealHistoryAndActivityRecords } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  // SCEN-470
  test("月初日の商談履歴が含まれているとき、正しく返される", () => {
    const customerId = "CUST-20240101-001";
    const dealHistory = [
      {
        dealId: "DEAL-20240101-001",
        dealName: "月初商談_test",
        dealDate: "2024-01-01",
        amount: 100000,
        status: "成約",
        customerId: customerId,
      },
    ];

    const activityRecords = [
      {
        activityId: "ACT-20240101-001",
        activityDate: "2024-01-01",
        activityType: "電話",
        description: "初回接触",
        customerId: customerId,
      },
    ];

    const result = fetchDealHistoryAndActivityRecords(
      customerId,
      dealHistory,
      activityRecords
    );

    expect(result.deals).toHaveLength(1);
    expect(result.deals[0]).toEqual({
      dealId: "DEAL-20240101-001",
      dealName: "月初商談_test",
      dealDate: "2024-01-01",
      amount: 100000,
      status: "成約",
      customerId: customerId,
    });

    expect(result.activities).toHaveLength(1);
    expect(result.activities[0]).toEqual({
      activityId: "ACT-20240101-001",
      activityDate: "2024-01-01",
      activityType: "電話",
      description: "初回接触",
      customerId: customerId,
    });

    expect(result.deals[0].amount).toBe(100000);
    expect(result.deals[0].status).toBe("成約");
    expect(result.activities[0].activityType).toBe("電話");
    expect(result.activities[0].description).toBe("初回接触");
  });
});