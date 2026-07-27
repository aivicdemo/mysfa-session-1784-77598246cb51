import {
  detectDealAmountDiscrepancy,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-277
  test("商談ステータスが『受注』に更新されたとき、請求金額が商談金額より高い場合、金額ズレが検出される", () => {
    const dealRecord = {
      deal_id: "DEAL-001",
      customer_id: "CUST-001",
      deal_amount: 500000,
      status: "受注",
      invoice_amount: 550000,
      invoice_issued_date: "2024-01-15T10:00:00Z",
      deal_status_updated_date: "2024-01-15T09:00:00Z",
    };

    const result = detectDealAmountDiscrepancy(dealRecord);

    expect(result.discrepancy_detected).toBe(true);
    expect(result.discrepancy_type).toBe("amount_mismatch");
    expect(result.discrepancy_amount).toBe(50000);
    expect(result.warning_message).toBe(
      "金額ズレ警告：請求金額が商談金額を50,000円上回っています"
    );
    expect(result.status_flag).toBe("検出済み");
    expect(result.deal_id).toBe("DEAL-001");
  });
});