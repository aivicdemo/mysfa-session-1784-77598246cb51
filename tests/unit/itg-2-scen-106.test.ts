import { calculateLineItemAmount, validateLineItemAmount } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-106
  test('[normal] 請求書承認検証機能 - 請求書明細の金額が単価×数量と一致するとき、計算検証を成功させる', () => {
    // テスト用の請求書明細データを準備
    const unitPrice = 1000;
    const quantity = 5;
    const expectedLineItemAmount = 5000;

    // InvoiceValidationService の calculateLineItemAmount メソッドを呼び出し
    const calculatedAmount = calculateLineItemAmount(unitPrice, quantity);

    // メソッドが計算結果（期待値：5,000円）を返すことを確認
    expect(calculatedAmount).toBe(expectedLineItemAmount);

    // 請求書オブジェクトを作成
    const invoiceLineItem = {
      unitPrice: unitPrice,
      quantity: quantity,
      amount: expectedLineItemAmount,
      verificationStatus: 'PENDING' as const,
    };

    // validateLineItemAmount を実行
    const validationResult = validateLineItemAmount(invoiceLineItem);

    // 検証ロジックの戻り値を確認
    expect(validationResult).toBe(true);

    // 請求書オブジェクトの検証ステータスが「CALCULATION_VERIFIED」に更新されることを確認
    expect(invoiceLineItem.verificationStatus).toBe('CALCULATION_VERIFIED');
  });
});