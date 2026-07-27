import { describe, test, expect } from '@jest/globals';
import { verifySalesRevenueAndInvoiceAlignment } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-641
  test('[normal] 売上実績と請求書のズレ解消機能 - 売上計上予定日と請求書発行日が完全一致するとき、ズレなしと判定される', () => {
    const expectedRevenueDate = new Date('2024-01-15T00:00:00Z');
    const invoiceIssuedDate = new Date('2024-01-15T00:00:00Z');

    const salesRecord = {
      id: 'sales-001',
      expectedRevenueDate: expectedRevenueDate,
      invoiceIssuedDate: invoiceIssuedDate,
      amount: 100000,
      customerId: 'customer-001',
      dealId: 'deal-001',
      invoiceNumber: 'INV-2024-001',
    };

    const result = verifySalesRevenueAndInvoiceAlignment(salesRecord);

    expect(result.mismatchFlag).toBe(false);
    expect(result.discrepancyDays).toBe(0);
    expect(result.status).toBe('ズレなし');
    expect(result.alignmentStatus).toBe('一致');
    expect(result.executionLog).toMatch(/売上計上予定日2024-01-15と請求書発行日2024-01-15が完全一致/);
  });
});