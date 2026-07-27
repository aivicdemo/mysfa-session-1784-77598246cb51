import { retrieveCustomerActivityHistory } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  // SCEN-476
  test("年度をまたぐ活動記録が含まれているとき、正しく返される", () => {
    const customerId = "CUST-001";
    const activityRecords = [
      {
        activityId: "ACT-001",
        customerId: customerId,
        dealName: "A案件",
        activityType: "初回面談",
        activityDate: new Date("2023-12-15T10:00:00Z"),
        fiscalYear: 2023,
        description: "初回面談を実施"
      },
      {
        activityId: "ACT-002",
        customerId: customerId,
        dealName: "A案件",
        activityType: "フォローアップ電話",
        activityDate: new Date("2024-01-10T14:30:00Z"),
        fiscalYear: 2024,
        description: "フォローアップ電話を実施"
      },
      {
        activityId: "ACT-003",
        customerId: customerId,
        dealName: "A案件",
        activityType: "提案資料送付",
        activityDate: new Date("2024-03-20T09:15:00Z"),
        fiscalYear: 2024,
        description: "提案資料を送付"
      }
    ];

    const result = retrieveCustomerActivityHistory(customerId, activityRecords);

    expect(result).toBeDefined();
    expect(result.activityCount).toBe(3);
    expect(result.activities).toHaveLength(3);

    expect(result.activities[0]).toEqual({
      activityId: "ACT-001",
      customerId: customerId,
      dealName: "A案件",
      activityType: "初回面談",
      activityDate: new Date("2023-12-15T10:00:00Z"),
      fiscalYear: 2023,
      description: "初回面談を実施"
    });

    expect(result.activities[1]).toEqual({
      activityId: "ACT-002",
      customerId: customerId,
      dealName: "A案件",
      activityType: "フォローアップ電話",
      activityDate: new Date("2024-01-10T14:30:00Z"),
      fiscalYear: 2024,
      description: "フォローアップ電話を実施"
    });

    expect(result.activities[2]).toEqual({
      activityId: "ACT-003",
      customerId: customerId,
      dealName: "A案件",
      activityType: "提案資料送付",
      activityDate: new Date("2024-03-20T09:15:00Z"),
      fiscalYear: 2024,
      description: "提案資料を送付"
    });

    expect(result.activities[0].activityDate.getFullYear()).toBe(2023);
    expect(result.activities[0].fiscalYear).toBe(2023);

    expect(result.activities[1].activityDate.getFullYear()).toBe(2024);
    expect(result.activities[1].fiscalYear).toBe(2024);

    expect(result.activities[2].activityDate.getFullYear()).toBe(2024);
    expect(result.activities[2].fiscalYear).toBe(2024);

    expect(result.activities[0].activityDate.getTime()).toBeLessThan(
      result.activities[1].activityDate.getTime()
    );
    expect(result.activities[1].activityDate.getTime()).toBeLessThan(
      result.activities[2].activityDate.getTime()
    );

    const fiscalYearCounts = result.activities.reduce(
      (acc, activity) => {
        acc[activity.fiscalYear] = (acc[activity.fiscalYear] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    expect(fiscalYearCounts[2023]).toBe(1);
    expect(fiscalYearCounts[2024]).toBe(2);
  });
});