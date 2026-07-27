import { validateDocumentContent } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-260: [normal] 帳票内容検証機能 - 複数明細のすべてが必須項目入力済みの場合、個別警告は表示されない
  test("should not display individual line warnings when all required fields in multiple line items are populated", () => {
    const document = {
      documentType: "QUOTE",
      customerId: "CUST-001",
      customerName: "Test Company Inc.",
      totalAmount: 330000,
      lineItems: [
        {
          lineId: "LINE-001",
          productName: "Software License",
          quantity: 10,
          unitPrice: 10000,
          amount: 100000,
          taxRate: 10,
        },
        {
          lineId: "LINE-002",
          productName: "Support Service",
          quantity: 5,
          unitPrice: 20000,
          amount: 100000,
          taxRate: 10,
        },
        {
          lineId: "LINE-003",
          productName: "Implementation",
          quantity: 1,
          unitPrice: 100000,
          amount: 100000,
          taxRate: 10,
        },
      ],
      issuedDate: "2024-01-15",
      dueDate: "2024-02-15",
    };

    const validationResult = validateDocumentContent(document);

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.individualLineWarnings).toEqual([]);
    expect(validationResult.overallWarnings).toEqual([]);
    expect(validationResult.canProceedToNextStep).toBe(true);
  });
});