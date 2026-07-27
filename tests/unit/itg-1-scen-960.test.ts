import { describe, test, expect } from '@jest/globals';
import { reconcileSalesAndInvoicing } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-960
  test('売上実績レコードが存在しない場合、照合処理は実行されず空の結果が返される', () => {
    const targetPeriodStart = new Date('2024-01-01T00:00:00Z');
    const targetPeriodEnd = new Date('2024-01-31T23:59:59Z');
    const emptySalesRecords: any[] = [];

    const result = reconcileSalesAndInvoicing({
      salesRecords: emptySalesRecords,
      invoiceRecords: [],
      targetPeriodStart,
      targetPeriodEnd,
    });

    expect(result.recordCount).toBe(0);
    expect(result.reconciliationStatus).toMatch(/データなし|実行なし/);
    expect(result.reconciliationTargets).toEqual([]);
    expect(result.mismatchedRecords).toEqual([]);
  });
});