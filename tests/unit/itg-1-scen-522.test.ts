import { reconcileDealAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-522
  test('商談レコードが0件のとき、照合処理は完了し、ズレ検出結果は空の一覧で返される', async () => {
    const startTime = Date.now();
    
    const result = await reconcileDealAndInvoice({
      deals: [],
      invoices: [],
    });
    
    const endTime = Date.now();
    const elapsedMs = endTime - startTime;
    
    expect(result.completionStatus).toBe('completed');
    expect(result.discrepancies).toEqual([]);
    expect(elapsedMs).toBeLessThan(100);
    expect(result.errorLogs).toEqual([]);
  });
});