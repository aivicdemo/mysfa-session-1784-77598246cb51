import { describe, test, expect } from '@jest/globals';
import { reconcileSalesAndInvoicing } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-944: 請求書ステータスがnullの場合、請求書未発行として扱われる', () => {
    // Arrange: テストデータの準備
    const salesRecord = {
      salesId: 'SR-001',
      invoiceId: 'INV-001',
      amount: 100000,
      dealStatus: 'won',
      expectedInvoiceDate: new Date('2024-01-15').toISOString(),
    };

    const invoiceRecord = {
      invoiceId: 'INV-001',
      status: null,
      amount: 100000,
      issueDate: null,
    };

    // Act: 売上実績・請求データ照合処理を実行
    const reconciliationResult = reconcileSalesAndInvoicing(
      salesRecord,
      invoiceRecord
    );

    // Assert: 請求書ステータスがnullの場合の期待結果を検証
    expect(reconciliationResult.invoiceStatus).toBe('未発行');
    expect(reconciliationResult.reconciliationStatus).toBe('未照合');
    expect(reconciliationResult.requiresAction).toBe(true);
    expect(reconciliationResult.salesId).toBe('SR-001');
    expect(reconciliationResult.invoiceId).toBe('INV-001');
  });
});