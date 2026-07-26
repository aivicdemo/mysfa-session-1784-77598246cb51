import { validateDocumentContent } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 帳票内容検証機能", () => {
  // SCEN-069
  test("帳票の金額が負数の場合、検証結果『エラー』が返却される", () => {
    const testDocument = {
      documentId: "DOC-20240115-001",
      customerId: "CUST-12345",
      documentType: "invoice",
      totalAmount: -1000,
      itemCount: 3,
      items: [
        {
          itemId: "ITEM-001",
          description: "商品A",
          quantity: 1,
          unitPrice: -500,
          lineTotal: -500,
        },
        {
          itemId: "ITEM-002",
          description: "商品B",
          quantity: 1,
          unitPrice: -300,
          lineTotal: -300,
        },
        {
          itemId: "ITEM-003",
          description: "商品C",
          quantity: 1,
          unitPrice: -200,
          lineTotal: -200,
        },
      ],
      taxAmount: 0,
      issueDate: "2024-01-15T09:00:00Z",
    };

    const result = validateDocumentContent(testDocument);

    expect(result.status).toBe("error");
    expect(result.isValid).toBe(false);
    expect(result.validationMessage).toMatch(/金額/);
    expect(result.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({
        field: "totalAmount",
        reason: expect.stringMatching(/負数|負の値/),
      })])
    );
    expect(result.errorCode).toBe("NEGATIVE_AMOUNT_ERROR");
    expect(result.detailedErrors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          itemId: "ITEM-001",
          lineTotal: -500,
          errorDetail: expect.stringMatching(/負数/),
        }),
        expect.objectContaining({
          itemId: "ITEM-002",
          lineTotal: -300,
          errorDetail: expect.stringMatching(/負数/),
        }),
        expect.objectContaining({
          itemId: "ITEM-003",
          lineTotal: -200,
          errorDetail: expect.stringMatching(/負数/),
        }),
      ])
    );
    expect(result.severity).toBe("critical");
  });
});