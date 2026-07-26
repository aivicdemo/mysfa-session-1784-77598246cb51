import { describe, test, expect } from "@jest/globals";
import { generateUnifiedInvoiceFormat } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-164: [error] 見積・注文・請求書統一フォーマット自動生成機能 - 商談に明細が1行も存在しない場合、生成処理がエラーになる
  test("商談に明細が1行も存在しない場合、エラーメッセージが表示される", () => {
    const negotiation_id = "NEG-2024-001";
    const customer_id = "CUST-12345";
    const customer_name = "山田太郎商事";
    const total_amount = 500000;
    const line_items = [];
    const negotiation_status = "受注";
    const invoice_due_date = "2024-02-15";

    const input = {
      negotiation_id,
      customer_id,
      customer_name,
      total_amount,
      line_items,
      negotiation_status,
      invoice_due_date,
    };

    expect(() => generateUnifiedInvoiceFormat(input)).toThrow(/明細/);
  });
});