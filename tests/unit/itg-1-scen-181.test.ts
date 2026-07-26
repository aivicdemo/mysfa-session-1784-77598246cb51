import { updateDealStatusOnCompletionNotification } from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-181
  test("対応完了の連絡が営業担当者に届いた場合、商談ステータスが『完了』に更新される", () => {
    const current_deal_id = "DEAL-20240415-001";
    const current_customer_id = "CUST-12345";
    const current_status_before = "進行中";
    const current_deal_amount = 1500000;
    const current_invoice_id = "INV-20240415-001";
    const current_invoice_amount = 1500000;
    const current_completion_notification_timestamp = new Date(
      "2024-04-15T14:30:00Z"
    );
    const current_expected_status_after = "完了";
    const current_expected_status_updated_at = "2024-04-15T14:30:00Z";

    const result = updateDealStatusOnCompletionNotification({
      deal_id: current_deal_id,
      customer_id: current_customer_id,
      current_status: current_status_before,
      deal_amount: current_deal_amount,
      invoice_id: current_invoice_id,
      invoice_amount: current_invoice_amount,
      completion_notification_timestamp: current_completion_notification_timestamp,
    });

    expect(result.deal_id).toBe(current_deal_id);
    expect(result.customer_id).toBe(current_customer_id);
    expect(result.updated_status).toBe(current_expected_status_after);
    expect(result.status_updated_at).toBe(current_expected_status_updated_at);
    expect(result.deal_amount).toBe(current_deal_amount);
    expect(result.invoice_id).toBe(current_invoice_id);
    expect(result.invoice_amount).toBe(current_invoice_amount);
    expect(result.invoice_linked).toBe(true);
    expect(result.history_logged).toBe(true);

    expect(result.invoice_amount).toBe(result.deal_amount);
  });
});