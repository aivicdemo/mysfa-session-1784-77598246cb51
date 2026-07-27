import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import {
  validateInvoice,
  approveInvoice,
} from "../../src/logic/it-1784969823049-2-1-2";

const fetchMock = require("jest-fetch-mock");

describe("顧客向けポータル - 請求書検証・承認機能", () => {
  // SCEN-052
  it("請求書の明細行が1行だけのとき、検証が正常に完了する", async () => {
    fetchMock.resetMocks();

    const invoice_id = "INV-20250101-001";
    const customer_id = "CUST-12345";
    const invoice_date = new Date("2025-01-01T09:00:00Z");
    const due_date = new Date("2025-02-01T09:00:00Z");
    const total_amount = 50000;
    const tax_amount = 5000;
    const subtotal_amount = 45000;
    const status_before_validation = "draft";
    const status_after_validation = "validated";
    const status_after_approval = "approved";

    // 明細行は1行のみ
    const invoice_line_items = [
      {
        line_item_id: "LINE-001",
        product_name: "サービス提供料",
        quantity: 1,
        unit_price: 45000,
        line_total: 45000,
      },
    ];

    const invoice_data = {
      invoice_id,
      customer_id,
      invoice_date,
      due_date,
      line_items: invoice_line_items,
      subtotal_amount,
      tax_amount,
      total_amount,
      status: status_before_validation,
    };

    // 検証処理のモック
    fetchMock.mockResponseOnce(
      JSON.stringify({
        invoice_id,
        status: status_after_validation,
        is_valid: true,
        validation_errors: [],
        validation_timestamp: "2025-01-01T09:15:00Z",
      }),
      { status: 200 }
    );

    // 承認処理のモック
    fetchMock.mockResponseOnce(
      JSON.stringify({
        invoice_id,
        status: status_after_approval,
        approval_timestamp: "2025-01-01T09:30:00Z",
        approver_id: "USER-999",
        approval_message: "承認完了しました。",
      }),
      { status: 200 }
    );

    // 検証処理を実行
    const validation_result = await validateInvoice(invoice_data);

    // 検証結果の検証
    expect(validation_result).toEqual({
      invoice_id,
      status: status_after_validation,
      is_valid: true,
      validation_errors: [],
      validation_timestamp: "2025-01-01T09:15:00Z",
    });

    // 明細行数が1行であることを確認
    expect(invoice_data.line_items.length).toBe(1);

    // 承認処理を実行
    const approval_result = await approveInvoice({
      invoice_id,
      approver_id: "USER-999",
    });

    // 承認結果の検証
    expect(approval_result).toEqual({
      invoice_id,
      status: status_after_approval,
      approval_timestamp: "2025-01-01T09:30:00Z",
      approver_id: "USER-999",
      approval_message: "承認完了しました。",
    });

    // 最終ステータスが承認済みであることを確認
    expect(approval_result.status).toBe(status_after_approval);

    // 金額計算の検証（明細1行 × 45000 + 税5000 = 50000）
    const calculated_total = invoice_line_items.reduce(
      (sum, item) => sum + item.line_total,
      0
    );
    expect(calculated_total + tax_amount).toBe(total_amount);
    expect(total_amount).toBe(50000);

    // API呼び出しが2回実行されたことを確認
    expect(fetchMock.mock.calls.length).toBe(2);
  });
});