import { detectDelayedBillingCases } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  // SCEN-086
  test("売上計上予定日と請求日のズレ検出 - 30日以上遅延の場合、遅延案件として検出される", () => {
    const deal_id = "DEAL-001";
    const customer_id = "CUST-001";
    const status = "受注";
    const revenue_recognition_date = new Date("2024-01-01T00:00:00Z");
    const billing_issue_date = new Date("2024-02-01T00:00:00Z");
    const deal_amount = 1000000;

    const input = {
      deal_id,
      customer_id,
      status,
      revenue_recognition_date,
      billing_issue_date,
      deal_amount,
    };

    const result = detectDelayedBillingCases(input);

    expect(result.is_delayed).toBe(true);
    expect(result.delay_days).toBe(31);
    expect(result.delay_flag).toBe("ON");
    expect(result.deal_id).toBe("DEAL-001");
    expect(result.customer_id).toBe("CUST-001");
    expect(result.status).toBe("受注");
    expect(result.deal_amount).toBe(1000000);
  });
});