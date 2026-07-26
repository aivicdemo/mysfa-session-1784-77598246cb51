import { detectMismatchesBetweenDealStatusAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-211
  test('商談レコードが存在しない場合でも処理がエラーで中断せずに空リストを返す', () => {
    // Arrange: 商談レコードが存在しない状態を表現する空配列
    const deals: any[] = [];
    const invoices: any[] = [];

    // Act: 照合・ズレ検出処理を実行
    const result = detectMismatchesBetweenDealStatusAndInvoice(deals, invoices);

    // Assert: 空配列を正常に返すこと
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});