import { extractInvoiceTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-783
  test('金額下限が金額上限を超えるとき、バリデーションエラーが発生する', () => {
    const minAmount = 100000;
    const maxAmount = 50000;

    expect(() =>
      extractInvoiceTargetData({
        minAmount,
        maxAmount,
      })
    ).toThrow(/金額下限は金額上限以下である必要があります/);
  });
});