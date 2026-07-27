import { fetchCustomerRecordWithActivities } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  // SCEN-442
  test("活動記録が0件の顧客レコードを表示するとき、空の一覧が返される", async () => {
    const customerIdInput = "CUST-001";
    const assumedCustomerRecord = {
      customerId: "CUST-001",
      customerName: "テスト顧客A",
      industry: "製造業",
      foundedDate: "2020-05-15",
    };
    const assumedActivitiesResponse = {
      customerId: "CUST-001",
      activities: [],
      message: "活動記録がありません",
    };

    const result = await fetchCustomerRecordWithActivities(customerIdInput);

    expect(result).toEqual({
      customerId: "CUST-001",
      customerName: "テスト顧客A",
      industry: "製造業",
      foundedDate: "2020-05-15",
      activities: [],
      activitySectionMessage: "活動記録がありません",
    });
    expect(result.activities.length).toBe(0);
  });
});