import { reconcileDealStatusWithInvoiceDate } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-215
  test("請求書発行日が不正な形式の場合、日付比較エラーが検出される", () => {
    const deal_record = {
      deal_id: "DEAL-001",
      customer_id: "CUST-001",
      deal_status: "契約済み",
      deal_amount: 500000,
      invoice_issued_date: "2024-13-45",
    };

    expect(() => reconcileDealStatusWithInvoiceDate(deal_record)).toThrow(
      /日付形式/
    );
  });

  test("請求書発行日が不正な形式（スラッシュ区切り不正）の場合、日付比較エラーが検出される", () => {
    const deal_record = {
      deal_id: "DEAL-002",
      customer_id: "CUST-002",
      deal_status: "契約済み",
      deal_amount: 300000,
      invoice_issued_date: "2024/15/60",
    };

    expect(() => reconcileDealStatusWithInvoiceDate(deal_record)).toThrow(
      /日付形式/
    );
  });

  test("請求書発行日が完全に不正な文字列の場合、日付比較エラーが検出される", () => {
    const deal_record = {
      deal_id: "DEAL-003",
      customer_id: "CUST-003",
      deal_status: "契約済み",
      deal_amount: 750000,
      invoice_issued_date: "invalid-date",
    };

    expect(() => reconcileDealStatusWithInvoiceDate(deal_record)).toThrow(
      /日付形式/
    );
  });

  test("請求書発行日が正しい形式の場合、照合処理が正常に完了する", () => {
    const deal_record = {
      deal_id: "DEAL-004",
      customer_id: "CUST-004",
      deal_status: "契約済み",
      deal_amount: 500000,
      invoice_issued_date: "2024-01-15",
    };

    const result = reconcileDealStatusWithInvoiceDate(deal_record);

    expect(result).toHaveProperty("reconciliation_status");
    expect(result.reconciliation_status).toBe("success");
  });

  test("商談ステータスが受注で請求日が正常な場合、ズレが検出されない", () => {
    const deal_record = {
      deal_id: "DEAL-005",
      customer_id: "CUST-005",
      deal_status: "受注",
      deal_amount: 1000000,
      expected_invoice_date: "2024-02-10",
      invoice_issued_date: "2024-02-10",
    };

    const result = reconcileDealStatusWithInvoiceDate(deal_record);

    expect(result).toHaveProperty("date_mismatch_detected");
    expect(result.date_mismatch_detected).toBe(false);
  });

  test("商談ステータスが受注で請求日がズレている場合、ズレが検出される", () => {
    const deal_record = {
      deal_id: "DEAL-006",
      customer_id: "CUST-006",
      deal_status: "受注",
      deal_amount: 800000,
      expected_invoice_date: "2024-03-01",
      invoice_issued_date: "2024-03-15",
    };

    const result = reconcileDealStatusWithInvoiceDate(deal_record);

    expect(result).toHaveProperty("date_mismatch_detected");
    expect(result.date_mismatch_detected).toBe(true);
    expect(result).toHaveProperty("mismatch_days");
    expect(result.mismatch_days).toBe(14);
  });

  test("請求書発行日が空文字列の場合、日付形式エラーが検出される", () => {
    const deal_record = {
      deal_id: "DEAL-007",
      customer_id: "CUST-007",
      deal_status: "契約済み",
      deal_amount: 450000,
      invoice_issued_date: "",
    };

    expect(() => reconcileDealStatusWithInvoiceDate(deal_record)).toThrow(
      /日付形式/
    );
  });
});