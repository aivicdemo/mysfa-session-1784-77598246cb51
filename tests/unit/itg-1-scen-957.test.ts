import { describe, test, expect } from '@jest/globals';
import { reconcileSalesAndInvoicing } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-957
  test('売上実績の記録日付がちょうど請求書の発行日付と一致する場合、日付が合致と判定される', () => {
    const salesRecordDate = '2024-01-15';
    const invoiceIssuanceDate = '2024-01-15';

    const result = reconcileSalesAndInvoicing({
      salesRecordDate,
      invoiceIssuanceDate,
    });

    expect(result.isDateMatched).toBe(true);
    expect(result.reconciliationStatus).toBe('照合完了（一致）');
    expect(result.displayMessage).toBe('日付が合致しています');
  });
});