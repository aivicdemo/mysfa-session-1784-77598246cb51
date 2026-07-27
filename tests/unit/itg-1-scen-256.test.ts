import { validateQuoteContent } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-256
  test("帳票内容検証機能 - 見積明細の単価が0円の場合、警告を表示する", () => {
    const quoteData = {
      quote_id: "QT-20240115-001",
      customer_id: "CUST-12345",
      customer_name: "テスト顧客株式会社",
      quote_date: "2024-01-15",
      line_items: [
        {
          line_number: 1,
          product_name: "ソフトウェアライセンス",
          quantity: 5,
          unit_price: 0,
          subtotal: 0,
        },
      ],
      total_amount: 0,
    };

    const validationResult = validateQuoteContent(quoteData);

    expect(validationResult.is_valid).toBe(false);
    expect(validationResult.warnings).toContainEqual(
      expect.objectContaining({
        line_number: 1,
        warning_type: "zero_unit_price",
        message: expect.stringMatching(/単価.*0円/),
      })
    );
    expect(validationResult.can_save).toBe(true);
  });
});