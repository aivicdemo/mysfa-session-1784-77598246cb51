import { describe, test, expect } from '@jest/globals';
import { reconcileDealStatusWithInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-557
  test('入力配列がnullのとき処理が失敗する', () => {
    expect(() => {
      reconcileDealStatusWithInvoices(null);
    }).toThrow(/入力配列|照合対象データ/);
  });
});