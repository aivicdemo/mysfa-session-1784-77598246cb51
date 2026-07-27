import { detectInvoiceDiscrepancies } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-741
  test('商談レコードに紐付く請求書が0件の場合、ズレ検出は成功する', () => {
    const dealRecord = {
      dealId: 'DEAL-001',
      status: '受注',
      amount: 100000,
      invoiceCount: 0,
    };

    const result = detectInvoiceDiscrepancies(dealRecord);

    expect(result).toEqual({
      dealId: 'DEAL-001',
      discrepancyType: '請求書未作成',
      detectionStatus: '検出完了',
      detectedCount: 1,
      errorOccurred: false,
    });
    expect(result.dealId).toBe('DEAL-001');
    expect(result.status).toBeUndefined();
    expect(result.discrepancyType).toBe('請求書未作成');
    expect(result.detectionStatus).toBe('検出完了');
    expect(result.detectedCount).toBe(1);
    expect(result.errorOccurred).toBe(false);
  });
});