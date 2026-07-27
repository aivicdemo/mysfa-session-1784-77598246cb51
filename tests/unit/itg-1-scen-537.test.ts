import { describe, test, expect, beforeEach } from '@jest/globals';
import { reconcileDealsAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-537: [edge] 金額ズレがちょうど許容範囲の上限のとき、正常ズレとして判定される
  test('should judge as normal discrepancy when amount difference is exactly at tolerance upper limit of 5000 yen', () => {
    // Arrange: テストデータを準備
    const deal = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      status: 'completed',
      deal_amount: 1000000,
      deal_date: new Date('2024-01-15T00:00:00Z'),
    };

    const invoice = {
      invoice_id: 'INV-001',
      deal_id: 'DEAL-001',
      invoice_amount: 1005000,
      invoice_date: new Date('2024-01-15T00:00:00Z'),
    };

    const tolerance_amount = 5000;

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        document_id: 'DOC-001',
        url: 'https://example.com/doc/DOC-001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        share_link: 'https://example.com/share/abc123',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // Act: 自動照合・ズレ検出機能を実行
    const result = reconcileDealsAndInvoices(
      deal,
      invoice,
      tolerance_amount,
      mockDocumentStorageAdapter
    );

    // Assert: 期待結果を検証
    // 金額ズレ: 1,005,000 - 1,000,000 = 5,000（許容範囲上限と一致）
    expect(result.amount_difference).toBe(5000);
    expect(result.discrepancy_classification).toBe('normal');
    expect(result.reconciliation_status).toBe('normal');
    expect(result.warning_message).toBeNull();
    expect(result.is_abnormal_flag).toBe(false);
  });
});