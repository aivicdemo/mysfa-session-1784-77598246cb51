import { validateDocumentGeneration } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-144
  test("顧客情報・商談金額・明細の必須項目がすべて入力されている場合、検証がOKと判定される", () => {
    const dealData = {
      dealId: "DEAL-001",
      dealStatus: "成約",
      dealAmount: 500000,
      dealCurrency: "JPY",
      customerInfo: {
        customerId: "CUST-001",
        customerName: "株式会社テスト",
        address: "東京都渋谷区道玄坂1-2-3",
        phoneNumber: "03-1234-5678",
        emailAddress: "contact@test-company.jp",
      },
      lineItems: [
        {
          lineItemId: "LINE-001",
          productName: "営業管理システム ライセンス",
          quantity: 10,
          unitPrice: 50000,
          totalPrice: 500000,
        },
      ],
    };

    const result = validateDocumentGeneration(dealData);

    expect(result.isValid).toBe(true);
    expect(result.validationStatus).toBe("OK");
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.canGenerateDocuments).toBe(true);
  });
});