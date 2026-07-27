import { detectSalesReconciliationDiscrepancy } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-650
  test('売上実績と請求書のズレ解消機能 - 売上実績の金額が請求書の金額より多いとき、マイナスのズレと検出される', () => {
    const salesRevenue = {
      amount: 150000,
    };

    const invoice = {
      amount: 100000,
    };

    const result = detectSalesReconciliationDiscrepancy(salesRevenue, invoice);

    expect(result.discrepancyAmount).toBe(-50000);
    expect(result.discrepancyType).toBe('negative_discrepancy');
  });
});