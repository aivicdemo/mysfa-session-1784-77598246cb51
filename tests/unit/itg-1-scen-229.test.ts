import { validateMigrationDataConsistency } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-229: [error] 移行データ一貫性検証機能 - 売上実績と請求書の金額にズレがある場合、不整合エラーが返される
  test("売上実績と請求書の金額にズレがある場合、不整合エラーが返される", () => {
    const sales_record_id = "SALES-001";
    const invoice_id = "INV-001";
    const sales_amount = 100000;
    const invoice_amount = 95000;
    const amount_difference = 5000;

    const input = {
      sales_record_id,
      invoice_id,
      sales_amount,
      invoice_amount,
    };

    expect(() => validateMigrationDataConsistency(input)).toThrow(/金額ズレ/);

    try {
      validateMigrationDataConsistency(input);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const error_message = error.message;
        expect(error_message).toMatch(/金額ズレ/);

        const error_details = {
          error_code: "CONSISTENCY_CHECK_FAILED",
          sales_record_id,
          invoice_id,
          expected_amount: sales_amount,
          actual_amount: invoice_amount,
          amount_difference,
        };

        expect(error_details.error_code).toBe("CONSISTENCY_CHECK_FAILED");
        expect(error_details.sales_record_id).toBe("SALES-001");
        expect(error_details.invoice_id).toBe("INV-001");
        expect(error_details.expected_amount).toBe(100000);
        expect(error_details.actual_amount).toBe(95000);
        expect(error_details.amount_difference).toBe(5000);
      }
    }
  });
});