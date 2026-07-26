import { validateDocumentContent } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 帳票内容検証機能", () => {
  // SCEN-067
  test("帳票の金額合計が明細行の合計と不一致の場合、検証結果『エラー』が返却される", () => {
    const documentData = {
      documentId: "DOC-2024-001",
      totalAmount: 150000,
      lineItems: [
        {
          itemId: "ITEM-001",
          description: "商品A",
          quantity: 2,
          unitPrice: 30000,
          lineTotal: 60000,
        },
        {
          itemId: "ITEM-002",
          description: "商品B",
          quantity: 1,
          unitPrice: 50000,
          lineTotal: 50000,
        },
      ],
      currency: "JPY",
      issuedDate: "2024-01-15T11:00:00Z",
    };

    const result = validateDocumentContent(documentData);

    expect(result).toEqual({
      status: "error",
      validationPassed: false,
      message: "金額合計と明細行合計が不一致です",
      expectedAmount: 110000,
      actualAmount: 150000,
      discrepancy: 40000,
      httpStatusCode: 400,
    });
    expect(result.validationPassed).toBe(false);
    expect(result.httpStatusCode).toBe(400);
    expect(result.status).toBe("error");
  });
});