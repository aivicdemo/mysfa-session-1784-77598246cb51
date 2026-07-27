import { fetchCustomerRecordsWithActivityHistory } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示", () => {
  // SCEN-473
  test("月末日の課題解決状況が含まれているとき、正しく返される", () => {
    const customer_id = "CUST-001";
    const month_end_date = new Date("2024-01-31T14:30:00Z");
    const month_end_date_iso = "2024-01-31T14:30:00Z";

    const deal_records = [
      {
        deal_id: "DEAL-100",
        customer_id: customer_id,
        deal_name: "契約更新",
        deal_status: "受注",
        deal_amount: 500000,
        created_at: "2024-01-31T10:00:00Z",
      },
    ];

    const issue_records = [
      {
        issue_id: "ISS-001",
        deal_id: "DEAL-100",
        issue_title: "納期調整要望",
        issue_status: "完了",
        created_at: month_end_date_iso,
      },
    ];

    const activity_records = [
      {
        activity_id: "ACT-001",
        deal_id: "DEAL-100",
        activity_type: "issue_resolution",
        activity_description: "課題解決対応",
        issue_id: "ISS-001",
        resolution_status: "完了",
        created_at: month_end_date_iso,
      },
    ];

    const result = fetchCustomerRecordsWithActivityHistory({
      customer_id: customer_id,
      deals: deal_records,
      issues: issue_records,
      activities: activity_records,
      filter_type: null,
      limit: 100,
    });

    expect(result).toBeDefined();
    expect(result.customer_id).toBe(customer_id);
    expect(result.activities).toHaveLength(1);

    const returned_activity = result.activities[0];
    expect(returned_activity.activity_id).toBe("ACT-001");
    expect(returned_activity.activity_type).toBe("issue_resolution");
    expect(returned_activity.resolution_status).toBe("完了");
    expect(returned_activity.created_at).toBe(month_end_date_iso);

    const day_of_month = new Date(returned_activity.created_at).getDate();
    const month = new Date(returned_activity.created_at).getMonth();
    const year = new Date(returned_activity.created_at).getFullYear();
    expect(day_of_month).toBe(31);
    expect(month).toBe(0);
    expect(year).toBe(2024);

    expect(result.activities[0].deal_id).toBe("DEAL-100");
  });
});