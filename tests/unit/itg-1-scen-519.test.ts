import { describe, test, expect } from "@jest/globals";
import { validateDealAmountAndInvoiceAlignment } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-519
  test("[error] 商談金額が空白のとき、金額ズレの判定がエラーで終了する", () => {
    const deal = {
      deal_id: "DEAL-001",
      status: "受注済み",
      amount: null,
    };

    const invoice = {
      invoice_id: "INV-001",
      deal_id: "DEAL-001",
      amount: 100000,
      issue_status: "発行済み",
    };

    expect(() => {
      validateDealAmountAndInvoiceAlignment(deal, invoice);
    }).toThrow(/商談金額が空白/);

    try {
      validateDealAmountAndInvoiceAlignment(deal, invoice);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const errorObject = error as any;
        expect(errorObject.code).toBe("DEAL_AMOUNT_EMPTY");
        expect(errorObject.statusCode).toBe(400);
        expect(errorObject.message).toContain("商談金額が空白のため金額照合ができません");
        expect(errorObject.details).toContain("DEAL-001");
      }
    }
  });
});