import { detectDateDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-536: [edge] 日付ズレが許容範囲の上限を1日超えるとき、警告ズレとして検出される
  test('日付ズレが許容範囲の上限を1日超えるとき、警告ズレとして検出される', () => {
    const allowedThreshold = 3;
    const contractDate = new Date('2024-01-10T00:00:00Z');
    const invoiceIssuedDate = new Date('2024-01-14T00:00:00Z');
    
    const discrepancyDays = Math.floor(
      (invoiceIssuedDate.getTime() - contractDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const dealRecord = {
      dealId: 'DEAL-001',
      status: '契約済み',
      contractDate: contractDate,
      expectedInvoiceDate: contractDate,
    };

    const invoiceRecord = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      issuedDate: invoiceIssuedDate,
    };

    const result = detectDateDiscrepancy(
      dealRecord,
      invoiceRecord,
      allowedThreshold
    );

    expect(result).toEqual({
      discrepancyType: 'WARNING',
      discrepancyDays: 4,
      allowedThreshold: 3,
      severity: 'warn',
      message: '請求書発行が契約日から4日後です。許容範囲（3日）を1日超過しています',
      requiresReview: true,
    });

    expect(result.discrepancyType).toBe('WARNING');
    expect(result.discrepancyDays).toBe(4);
    expect(result.allowedThreshold).toBe(3);
    expect(result.severity).toBe('warn');
    expect(result.requiresReview).toBe(true);
  });
});