import { fetchCustomerActivityRecords } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  // SCEN-443
  test("活動記録が1件の顧客レコードを表示するとき、その1件が返される", () => {
    const customer_id = "CUST-001";
    const activity_id = "ACT-001";
    const activity_datetime = "2024-01-15T14:30:00Z";
    const activity_content = "初回打ち合わせ";
    const activity_type = "接触";

    const mock_activities = [
      {
        id: activity_id,
        customer_id: customer_id,
        datetime: activity_datetime,
        content: activity_content,
        type: activity_type,
      },
    ];

    const result = fetchCustomerActivityRecords(customer_id, mock_activities);

    expect(result).toEqual([
      {
        id: activity_id,
        customer_id: customer_id,
        datetime: activity_datetime,
        content: activity_content,
        type: activity_type,
      },
    ]);
    expect(result).toHaveLength(1);
  });
});