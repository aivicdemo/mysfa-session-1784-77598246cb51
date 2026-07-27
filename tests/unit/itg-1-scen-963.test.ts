import { detectSalesRevenueInvoiceMismatch } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-963
  test('売上実績の商談IDが請求書に紐付く商談IDと一致しない場合、商談紐付け不整合として検出される', () => {
    const salesRevenue = {
      id: 'REVENUE-001',
      dealId: 'DEAL-001',
      amount: 100000,
      recordedDate: '2024-01-15',
    };

    const invoice = {
      id: 'INV-001',
      dealId: 'DEAL-002',
      amount: 100000,
      issuedDate: '2024-01-15',
    };

    const result = detectSalesRevenueInvoiceMismatch(
      salesRevenue,
      invoice
    );

    expect(result.hasMismatch).toBe(true);
    expect(result.mismatchType).toBe('dealIdMismatch');
    expect(result.mismatchDetails).toMatch(/DEAL-001/);
    expect(result.mismatchDetails).toMatch(/DEAL-002/);
    expect(result.errorMessage).toMatch(/商談紐付け不整合/);
  });
});