import { validateEstimateContent } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-254
  test("帳票内容検証機能 - 見積明細の数量が0の場合、警告を表示する", () => {
    const estimateData = {
      customerInfo: {
        companyName: "テスト太郎商事",
        contactPersonName: "山田太郎",
      },
      estimateLines: [
        {
          productName: "商品A",
          unitPrice: 1000,
          quantity: 0,
        },
      ],
    };

    const validationResult = validateEstimateContent(estimateData);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.warnings).toContainEqual(
      expect.objectContaining({
        message: expect.stringMatching(/見積明細の数量が0/),
        targetProduct: "商品A",
      })
    );
    expect(validationResult.canSave).toBe(false);
  });
});