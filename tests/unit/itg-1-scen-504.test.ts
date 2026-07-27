import { detectDealInvoiceDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-504
  test('商談ステータスが「受注」で請求書発行日が商談クローズ日より前のとき、ズレが負の値で検出される', () => {
    const dealData = {
      dealId: 'DEAL-001',
      status: '受注',
      closeDate: new Date('2024-01-15T00:00:00Z'),
    };

    const invoiceData = {
      invoiceId: 'INV-001',
      issuedDate: new Date('2024-01-10T00:00:00Z'),
      dealId: 'DEAL-001',
    };

    const result = detectDealInvoiceDiscrepancy(dealData, invoiceData);

    expect(result.discrepancyDays).toBe(-5);
    expect(result.discrepancyDescription).toBe('請求書発行日がクローズ日より5日前');
    expect(result.targetDealId).toBe('DEAL-001');
    expect(result.targetInvoiceId).toBe('INV-001');
    expect(result.discrepancyCategory).toBe('請求書先行');
  });
});