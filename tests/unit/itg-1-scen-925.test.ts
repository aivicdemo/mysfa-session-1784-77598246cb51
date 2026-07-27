import { reconcileSalesAndInvoice } from "../../src/logic/it-1784969823049-1-1-1";

describe("売上実績・請求データ照合機能", () => {
  // SCEN-925
  test("売上計上予定日と請求日のズレがちょうど0日の場合、ズレなしと判定される", () => {
    const sales_record = {
      sales_id: "SLS-001",
      planned_accounting_date: new Date("2024-01-15"),
      amount: 100000,
    };

    const invoice_record = {
      invoice_id: "INV-001",
      invoice_date: new Date("2024-01-15"),
      amount: 100000,
    };

    const result = reconcileSalesAndInvoice(sales_record, invoice_record);

    expect(result.date_gap_days).toBe(0);
    expect(result.gap_status).toBe("ズレなし");
  });
});