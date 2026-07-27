import { validateDocumentContent } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け - 帳票内容検証機能", () => {
  // SCEN-268
  test("顧客情報のメールアドレス形式が不正な場合、警告を表示する", () => {
    const invalidEmailFormats = [
      "customer@invalid",
      "customer@.com",
      "customer@domain",
      "@example.com",
      "customer@",
      "customer",
    ];

    invalidEmailFormats.forEach((invalidEmail) => {
      const documentData = {
        customerInfo: {
          name: "テスト顧客",
          email: invalidEmail,
          phone: "09012345678",
          address: "東京都渋谷区",
        },
        dealAmount: 100000,
        items: [
          {
            description: "商品A",
            quantity: 1,
            unitPrice: 100000,
          },
        ],
      };

      const result = validateDocumentContent(documentData);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(
        "顧客情報のメールアドレス形式が不正です。正しいメールアドレスを入力してください"
      );
      expect(result.canGenerate).toBe(false);
    });
  });
});