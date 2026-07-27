import { fetchCustomerDealHistoryWithActivities } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  // SCEN-454
  test("商談履歴に同じ日時の重複レコードが含まれているとき、両方が返される", () => {
    const customerId = "CUST-001";
    const sharedTimestamp = new Date("2024-01-15T14:30:00Z");

    const dealRecordA = {
      deal_id: "DEAL-100",
      customer_id: customerId,
      deal_name: "Project Alpha",
      status: "提案中",
      amount: 500000,
      created_at: sharedTimestamp,
      updated_at: sharedTimestamp,
    };

    const dealRecordB = {
      deal_id: "DEAL-101",
      customer_id: customerId,
      deal_name: "Project Beta",
      status: "交渉中",
      amount: 750000,
      created_at: sharedTimestamp,
      updated_at: sharedTimestamp,
    };

    const mockDealHistory = [dealRecordA, dealRecordB];
    const mockActivityRecords = [];

    const result = fetchCustomerDealHistoryWithActivities(
      customerId,
      mockDealHistory,
      mockActivityRecords
    );

    expect(result.deals).toHaveLength(2);
    expect(result.deals).toContainEqual(
      expect.objectContaining({
        deal_id: "DEAL-100",
        customer_id: customerId,
        deal_name: "Project Alpha",
        status: "提案中",
        amount: 500000,
        created_at: sharedTimestamp,
      })
    );
    expect(result.deals).toContainEqual(
      expect.objectContaining({
        deal_id: "DEAL-101",
        customer_id: customerId,
        deal_name: "Project Beta",
        status: "交渉中",
        amount: 750000,
        created_at: sharedTimestamp,
      })
    );

    const dealIds = result.deals.map((d) => d.deal_id);
    expect(dealIds).toEqual(["DEAL-100", "DEAL-101"]);
  });
});