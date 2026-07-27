import { extractBillingTargetData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-792: [edge] 請求対象データ抽出機能 - 年度をまたぐ期間で抽出するとき、期間内の全データが正しく抽出される
  test("should extract all billing target data correctly when extraction period spans fiscal years", () => {
    // Setup: テストデータベース用の売上レコード
    // 前年度データ（2024年2月28日）
    const previousYearFeb28_Record1 = {
      dealId: "deal_prev_feb_1",
      customerId: "cust_001",
      amount: 50000,
      recordDate: new Date("2024-02-28T10:00:00Z"),
      status: "completed",
    };
    const previousYearFeb28_Record2 = {
      dealId: "deal_prev_feb_2",
      customerId: "cust_002",
      amount: 75000,
      recordDate: new Date("2024-02-28T14:30:00Z"),
      status: "completed",
    };

    // 前年度データ（2024年3月15日）
    const previousYearMar15_Record1 = {
      dealId: "deal_prev_mar_1",
      customerId: "cust_003",
      amount: 100000,
      recordDate: new Date("2024-03-15T09:00:00Z"),
      status: "completed",
    };
    const previousYearMar15_Record2 = {
      dealId: "deal_prev_mar_2",
      customerId: "cust_004",
      amount: 150000,
      recordDate: new Date("2024-03-15T11:15:00Z"),
      status: "completed",
    };
    const previousYearMar15_Record3 = {
      dealId: "deal_prev_mar_3",
      customerId: "cust_005",
      amount: 200000,
      recordDate: new Date("2024-03-15T15:45:00Z"),
      status: "completed",
    };

    // 当年度データ（2024年4月1日）
    const currentYearApr1_Record1 = {
      dealId: "deal_curr_apr1_1",
      customerId: "cust_006",
      amount: 120000,
      recordDate: new Date("2024-04-01T08:30:00Z"),
      status: "completed",
    };
    const currentYearApr1_Record2 = {
      dealId: "deal_curr_apr1_2",
      customerId: "cust_007",
      amount: 180000,
      recordDate: new Date("2024-04-01T13:00:00Z"),
      status: "completed",
    };

    // 当年度データ（2024年4月30日）
    const currentYearApr30_Record1 = {
      dealId: "deal_curr_apr30_1",
      customerId: "cust_008",
      amount: 90000,
      recordDate: new Date("2024-04-30T16:20:00Z"),
      status: "completed",
    };

    // 全テストデータを配列にまとめる
    const allBillingRecords = [
      previousYearFeb28_Record1,
      previousYearFeb28_Record2,
      previousYearMar15_Record1,
      previousYearMar15_Record2,
      previousYearMar15_Record3,
      currentYearApr1_Record1,
      currentYearApr1_Record2,
      currentYearApr30_Record1,
    ];

    // 抽出期間を指定（2024年3月1日～2024年4月30日）
    const extractionStartDate = new Date("2024-03-01T00:00:00Z");
    const extractionEndDate = new Date("2024-04-30T23:59:59Z");

    // 請求対象データ抽出機能を呼び出す
    const extractedData = extractBillingTargetData(
      allBillingRecords,
      extractionStartDate,
      extractionEndDate
    );

    // 期待結果の検証
    // 指定期間内の全9件が抽出されることを確認
    expect(extractedData.records.length).toBe(9);

    // 抽出されたレコードの詳細確認
    expect(extractedData.records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ dealId: "deal_prev_feb_1", amount: 50000 }),
        expect.objectContaining({ dealId: "deal_prev_feb_2", amount: 75000 }),
        expect.objectContaining({ dealId: "deal_prev_mar_1", amount: 100000 }),
        expect.objectContaining({ dealId: "deal_prev_mar_2", amount: 150000 }),
        expect.objectContaining({ dealId: "deal_prev_mar_3", amount: 200000 }),
        expect.objectContaining({
          dealId: "deal_curr_apr1_1",
          amount: 120000,
        }),
        expect.objectContaining({
          dealId: "deal_curr_apr1_2",
          amount: 180000,
        }),
        expect.objectContaining({
          dealId: "deal_curr_apr30_1",
          amount: 90000,
        }),
      ])
    );

    // 合計金額の検証（期待値：965,000円）
    const totalAmount = extractedData.records.reduce(
      (sum, record) => sum + record.amount,
      0
    );
    expect(totalAmount).toBe(965000);

    // 抽出期間内のすべてのレコードが対象期間内にあることを確認
    extractedData.records.forEach((record) => {
      expect(record.recordDate.getTime()).toBeGreaterThanOrEqual(
        extractionStartDate.getTime()
      );
      expect(record.recordDate.getTime()).toBeLessThanOrEqual(
        extractionEndDate.getTime()
      );
    });
  });
});