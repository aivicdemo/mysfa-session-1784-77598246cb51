import { detectDueDateMismatch } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-309
  test("[error] 商談ステータスと請求データの紐付け・可視化 - 請求書レコードに発行日が不在のとき、期日ズレ検出が失敗する", () => {
    const negotiationId = "NEG-2025-001";
    const invoiceId = "INV-2025-001";

    const negotiationRecord = {
      negotiation_id: negotiationId,
      customer_id: "CUST-001",
      status: "見積提示済み",
      amount: 500000,
      created_at: new Date("2025-01-15T09:00:00Z"),
    };

    const invoiceRecord = {
      invoice_id: invoiceId,
      negotiation_id: negotiationId,
      customer_id: "CUST-001",
      issued_date: null as null | string,
      due_date: "2025-02-28",
      amount: 500000,
    };

    const mockLogger = {
      errors: [] as string[],
      log: function (message: string) {
        this.errors.push(message);
      },
    };

    const result = detectDueDateMismatch(negotiationRecord, invoiceRecord, mockLogger);

    expect(result).toEqual({
      invoice_id: invoiceId,
      status: "判定不可",
      error_message: "発行日が不在のため期日ズレ判定を実行できません",
      mismatch_detected: false,
      is_unprocessable: true,
    });

    expect(mockLogger.errors.length).toBeGreaterThan(0);
    expect(mockLogger.errors[0]).toMatch(/発行日/);

    expect(result.is_unprocessable).toBe(true);
  });
});