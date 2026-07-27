import { detectInvoiceDiscrepancies } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-517: 商談クローズ日が空白のとき、日付ズレの判定がエラーで終了する", () => {
    const dealRecords = [
      {
        deal_id: "D001",
        deal_name: "テスト商談",
        customer_name: "テスト顧客",
        amount: 100000,
        status: "クローズ",
        close_date: null,
        invoice_issue_date: new Date("2024-01-15T10:00:00Z"),
      },
    ];

    expect(() => detectInvoiceDiscrepancies(dealRecords)).toThrow(
      /クローズ日/
    );
  });
});