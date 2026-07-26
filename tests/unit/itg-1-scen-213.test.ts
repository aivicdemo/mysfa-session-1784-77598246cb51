import { validateInvoiceApproval } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-213: [error] 請求書承認検証 - 請求明細の金額合計が請求書ヘッダーの金額と不一致のとき差戻し指示が生成される
  test("請求明細の合計金額がヘッダー金額と不一致のとき差戻し指示が生成される", () => {
    const invoiceData = {
      invoiceId: "INV-20240415-001",
      headerAmount: 100000,
      customerId: "CUST-001",
      invoiceDate: "2024-04-15T00:00:00Z",
      details: [
        {
          detailId: "DET-001",
          itemName: "商品A",
          unitPrice: 30000,
          quantity: 1,
          lineAmount: 30000,
        },
        {
          detailId: "DET-002",
          itemName: "商品B",
          unitPrice: 40000,
          quantity: 1,
          lineAmount: 40000,
        },
        {
          detailId: "DET-003",
          itemName: "商品C",
          unitPrice: 20000,
          quantity: 1,
          lineAmount: 20000,
        },
      ],
    };

    const result = validateInvoiceApproval(invoiceData);

    expect(result.isValid).toBe(false);
    expect(result.status).toBe("差戻し");
    expect(result.detailsTotal).toBe(90000);
    expect(result.headerAmount).toBe(100000);
    expect(result.difference).toBe(-10000);
    expect(result.errorMessage).toMatch(/請求明細の合計金額/);
    expect(result.errorMessage).toMatch(/ヘッダー金額/);
    expect(result.errorMessage).toMatch(/一致/);
  });
});