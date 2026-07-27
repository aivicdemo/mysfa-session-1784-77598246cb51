import { detectDelayedInvoicesByDealStatus } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-578
  test('入力配列がnullの場合、例外が発生する', () => {
    expect(() => detectDelayedInvoicesByDealStatus(null)).toThrow(/入力配列/);
  });
});