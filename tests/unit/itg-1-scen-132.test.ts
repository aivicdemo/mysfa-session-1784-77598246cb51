import { verifyDocumentAmounts } from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-132: [edge] 帳票生成検証機能 - 見積・注文・請求書の金額がすべて一致していることを検証できる
  test("見積・注文・請求書の金額照合により完全一致を確認", () => {
    const quote_amount = 100000;
    const quote_tax = 10000;
    const quote_total = 110000;

    const order_amount = 100000;
    const order_tax = 10000;
    const order_total = 110000;

    const invoice_amount = 100000;
    const invoice_tax = 10000;
    const invoice_total = 110000;

    const quote_data = {
      product_amount: quote_amount,
      tax_amount: quote_tax,
      total_amount: quote_total,
    };

    const order_data = {
      product_amount: order_amount,
      tax_amount: order_tax,
      total_amount: order_total,
    };

    const invoice_data = {
      product_amount: invoice_amount,
      tax_amount: invoice_tax,
      total_amount: invoice_total,
    };

    const verification_result = verifyDocumentAmounts(
      quote_data,
      order_data,
      invoice_data
    );

    expect(verification_result.is_all_matched).toBe(true);
    expect(verification_result.status).toBe("完全一致");
    expect(verification_result.product_amount_match).toBe(true);
    expect(verification_result.tax_amount_match).toBe(true);
    expect(verification_result.total_amount_match).toBe(true);
    expect(verification_result.errors).toEqual([]);
    expect(verification_result.discrepancies).toEqual([]);
  });

  // 追加テスト：金額不一致を検出
  test("見積・注文・請求書の金額照合により不一致を検出", () => {
    const quote_data = {
      product_amount: 100000,
      tax_amount: 10000,
      total_amount: 110000,
    };

    const order_data = {
      product_amount: 100000,
      tax_amount: 10000,
      total_amount: 110000,
    };

    const invoice_data = {
      product_amount: 100000,
      tax_amount: 11000,
      total_amount: 111000,
    };

    const verification_result = verifyDocumentAmounts(
      quote_data,
      order_data,
      invoice_data
    );

    expect(verification_result.is_all_matched).toBe(false);
    expect(verification_result.status).toBe("不一致");
    expect(verification_result.tax_amount_match).toBe(false);
    expect(verification_result.total_amount_match).toBe(false);
    expect(verification_result.discrepancies.length).toBeGreaterThan(0);
  });

  // 追加テスト：注文書と請求書のみ不一致
  test("見積は一致し注文・請求書に不一致を検出", () => {
    const quote_data = {
      product_amount: 100000,
      tax_amount: 10000,
      total_amount: 110000,
    };

    const order_data = {
      product_amount: 95000,
      tax_amount: 9500,
      total_amount: 104500,
    };

    const invoice_data = {
      product_amount: 100000,
      tax_amount: 10000,
      total_amount: 110000,
    };

    const verification_result = verifyDocumentAmounts(
      quote_data,
      order_data,
      invoice_data
    );

    expect(verification_result.is_all_matched).toBe(false);
    expect(verification_result.product_amount_match).toBe(false);
    expect(verification_result.tax_amount_match).toBe(false);
    expect(verification_result.total_amount_match).toBe(false);
  });

  // 追加テスト：必須項目不足時のエラー検出
  test("見積書の必須項目不足でエラーを検出", () => {
    const quote_data = {
      product_amount: 100000,
      tax_amount: 10000,
      total_amount: undefined,
    };

    const order_data = {
      product_amount: 100000,
      tax_amount: 10000,
      total_amount: 110000,
    };

    const invoice_data = {
      product_amount: 100000,
      tax_amount: 10000,
      total_amount: 110000,
    };

    expect(() =>
      verifyDocumentAmounts(quote_data as any, order_data, invoice_data)
    ).toThrow(/金額/);
  });

  // 追加テスト：全帳票の金額が0の場合
  test("全帳票の金額が0円で完全一致を確認", () => {
    const quote_data = {
      product_amount: 0,
      tax_amount: 0,
      total_amount: 0,
    };

    const order_data = {
      product_amount: 0,
      tax_amount: 0,
      total_amount: 0,
    };

    const invoice_data = {
      product_amount: 0,
      tax_amount: 0,
      total_amount: 0,
    };

    const verification_result = verifyDocumentAmounts(
      quote_data,
      order_data,
      invoice_data
    );

    expect(verification_result.is_all_matched).toBe(true);
    expect(verification_result.status).toBe("完全一致");
    expect(verification_result.product_amount_match).toBe(true);
  });

  // 追加テスト：大規模金額の検証
  test("大規模金額（複数商品）で完全一致を確認", () => {
    const quote_data = {
      product_amount: 5000000,
      tax_amount: 500000,
      total_amount: 5500000,
    };

    const order_data = {
      product_amount: 5000000,
      tax_amount: 500000,
      total_amount: 5500000,
    };

    const invoice_data = {
      product_amount: 5000000,
      tax_amount: 500000,
      total_amount: 5500000,
    };

    const verification_result = verifyDocumentAmounts(
      quote_data,
      order_data,
      invoice_data
    );

    expect(verification_result.is_all_matched).toBe(true);
    expect(verification_result.status).toBe("完全一致");
    expect(verification_result.product_amount_match).toBe(true);
    expect(verification_result.tax_amount_match).toBe(true);
    expect(verification_result.total_amount_match).toBe(true);
  });
});