import { describe, test, expect, beforeEach } from "@jest/globals";
import { reconcileStatusAndInvoice } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-738
  test("should return success reconciliation when deal status is lost and invoice is unpaid", () => {
    const deal_input = {
      deal_id: "DEAL-001",
      customer_name: "テスト顧客A",
      status: "失注",
      amount: 500000,
    };

    const invoice_input = {
      invoice_id: "INV-001",
      deal_id: "DEAL-001",
      status: "未発行",
      amount: 500000,
    };

    const result = reconcileStatusAndInvoice(deal_input, invoice_input);

    expect(result.reconciliation_status).toBe("成功");
    expect(result.deal_id).toBe("DEAL-001");
    expect(result.display_message).toBe(
      "DEAL-001：照合成功（失注案件・請求未発行のため不整合なし）"
    );
    expect(result.reason).toBe(
      "失注ステータスの商談は請求発行義務がないため、未発行状態は正常"
    );
    expect(result.reconciliation_log).toEqual({
      executed_at: expect.any(String),
      target_deal_id: "DEAL-001",
      judgment_result: "成功",
      reason: "失注ステータスの商談は請求発行義務がないため、未発行状態は正常",
    });
  });
});