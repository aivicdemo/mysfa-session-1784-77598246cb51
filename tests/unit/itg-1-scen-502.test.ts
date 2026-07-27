import { detectMismatch } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-502
  test("[normal] 商談ステータスが「受注」で請求書発行日が商談クローズ日と一致するとき、ズレがないと判定される", () => {
    const deal = {
      deal_id: "DEAL-20240115-001",
      customer_name: "テスト顧客A",
      status: "受注",
      close_date: "2024-01-15",
      amount: 1000000,
    };

    const invoice = {
      invoice_id: "INV-20240115-001",
      deal_id: "DEAL-20240115-001",
      issue_date: "2024-01-15",
      amount: 1000000,
      status: "発行済",
    };

    const result = detectMismatch(deal, invoice);

    expect(result.reconciliation_status).toBe("MATCHED");
    expect(result.detection_status).toBe("一致");
    expect(result.difference_content).toBe("");
    expect(result.detected_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);
  });
});