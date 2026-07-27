import { detectDateDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-527
  test('商談クローズ日が月初のとき、正常に日付ズレが計算される', () => {
    // Arrange: テストデータの準備
    const dealId = 'DEAL-001';
    const dealCloseDate = '2024-04-01';
    const invoiceIssuedDate = '2024-04-15';
    const expectedDaysDifference = 14;

    // DocumentStorageAdapter のスタブを設定
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-001',
        uploadedAt: '2024-04-15T10:00:00Z'
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.google.com/file/d/mock-doc-id/view'
      }),
      deleteDocument: jest.fn().mockResolvedValue(true)
    };

    const input = {
      dealId,
      dealCloseDate,
      invoiceIssuedDate,
      documentStorageAdapter: mockDocumentStorageAdapter
    };

    // Act: ズレ検出ロジックを実行
    const result = detectDateDiscrepancy(input);

    // Assert: 戻り値を検証
    expect(result).toEqual({
      discrepancyDetected: true,
      dealCloseDate: '2024-04-01',
      invoiceIssuedDate: '2024-04-15',
      daysDifference: 14,
      discrepancyType: 'INVOICE_ISSUED_AFTER_DEAL_CLOSE',
      severity: 'WARNING',
      message: '商談クローズ日が月初（4月1日）のため、月初から月中旬への請求書発行ズレ（14日間）が正常に計算されました'
    });

    // 期待値の詳細検証
    expect(result.discrepancyDetected).toBe(true);
    expect(result.daysDifference).toBe(expectedDaysDifference);
    expect(result.discrepancyType).toBe('INVOICE_ISSUED_AFTER_DEAL_CLOSE');
    expect(result.severity).toBe('WARNING');
  });
});