import { reconcileSalesAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-961
  test('請求書レコードが存在しない場合、照合処理は実行されず空の結果が返される', () => {
    const salesRecords = [
      {
        id: 'SALES001',
        customerId: 'C001',
        saleDate: '2024-01-15',
        amount: 100000,
        dealId: 'DEAL001'
      }
    ];

    const invoiceRecords: unknown[] = [];

    const reconciliationParams = {
      periodStart: '2024-01-01',
      periodEnd: '2024-01-31'
    };

    const result = reconcileSalesAndInvoices(salesRecords, invoiceRecords, reconciliationParams);

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([]);
    expect(result.length).toBe(0);
  });
});