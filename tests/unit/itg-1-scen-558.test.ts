import { reconcileDealStatusAndInvoiceStatus } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-558
  test('入力配列がundefinedのとき処理が失敗する', () => {
    const undefinedInput = undefined;

    expect(() => {
      reconcileDealStatusAndInvoiceStatus(undefinedInput as any);
    }).toThrow(/入力配列が無効です|Cannot read properties of undefined/);
  });
});