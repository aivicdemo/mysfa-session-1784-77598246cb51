import { reconcileDealAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-747
  test('商談金額が欠落している場合、金額照合はスキップされる', () => {
    const dealRecord = {
      dealId: 'DL-20250115-001',
      customerName: 'ABC株式会社',
      status: '受注',
      amount: null,
    };

    const invoiceRecord = {
      invoiceId: 'INV-20250115-001',
      invoiceAmount: 500000,
    };

    const result = reconcileDealAndInvoice(dealRecord, invoiceRecord);

    expect(result.amountReconciliationStatus).toBe('スキップ（商談金額が未設定のため）');
    expect(result.dealStatus).toBe('受注');
    expect(result.invoiceStatus).toBe(invoiceRecord.invoiceStatus || undefined);
    expect(result.error).toBeUndefined();
    expect(result.reconciliationLog).toContain('金額照合：スキップ（商談金額が未設定のため）');
  });
});