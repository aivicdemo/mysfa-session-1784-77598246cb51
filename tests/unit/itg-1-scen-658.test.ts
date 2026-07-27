import { validateInvoiceAmount } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-658
  test('請求書金額が無効な数値形式のとき、バリデーションエラーが発生する', () => {
    const invalidAmounts = [
      'abc',
      '12.34.56',
      '¥1,000',
      '',
      'null',
      'undefined',
      '1.2.3',
      '-',
    ];

    invalidAmounts.forEach((invalidAmount) => {
      const result = validateInvoiceAmount(invalidAmount);

      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('INVOICE_AMOUNT_INVALID_FORMAT');
      expect(result.errorMessage).toBe(
        '請求書金額は有効な数値形式で入力してください'
      );
      expect(result.fieldName).toBe('amount');
      expect(result.isSavedToDatabase).toBe(false);
      expect(result.externalServicesCalled).toStrictEqual([]);
    });
  });
});