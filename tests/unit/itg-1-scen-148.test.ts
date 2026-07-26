import { validateDocumentAmountAndLineItems } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-148
  test("帳票の金額合計と明細行数が妥当な場合、検証結果がOKと判定される", () => {
    const documentData = {
      totalAmount: 45000,
      lineItems: [
        { amount: 10000, description: "売上データ1" },
        { amount: 20000, description: "売上データ2" },
        { amount: 15000, description: "売上データ3" }
      ],
      lineCount: 3
    };

    const result = validateDocumentAmountAndLineItems(documentData);

    expect(result.status).toBe("OK");
    expect(result.isValid).toBe(true);
    expect(result.totalAmount).toBe(45000);
    expect(result.lineCount).toBe(3);
    expect(result.calculatedTotal).toBe(45000);
    expect(result.message).toBe("帳票金額と明細が正確です");
  });
});