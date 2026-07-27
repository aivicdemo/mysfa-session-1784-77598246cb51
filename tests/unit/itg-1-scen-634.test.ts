import { describe, test, expect, beforeEach } from "@jest/globals";
import { reconcileDealStatusAndInvoiceStatus } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-634
  test("商談IDが空のとき、バリデーションエラーが発生する", () => {
    const invalidInput = {
      deal_id: "",
      invoice_issued_date: "2024-04-15T10:30:00Z",
      status_category: "受注",
      planned_revenue_date: "2024-04-10T00:00:00Z",
    };

    expect(() => {
      reconcileDealStatusAndInvoiceStatus(invalidInput);
    }).toThrow(/商談ID/);
  });
});