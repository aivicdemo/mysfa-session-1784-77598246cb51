import { detectDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-534: [normal] 金額ズレが業務上の許容範囲を超えているとき、警告ズレとして検出される
  test('金額ズレが許容範囲(5%)を超える場合、警告ズレとして検出される', () => {
    // Arrange
    const dealRecord = {
      dealId: 'DEAL-001',
      status: '成約',
      amount: 1000000,
    };

    const invoiceRecord = {
      invoiceId: 'INV-001',
      dealId: 'DEAL-001',
      amount: 1050000,
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: 'file-123',
        uploadedAt: new Date('2024-01-15T11:00:00Z').toISOString(),
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.google.com/file/d/file-123',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const executionTime = new Date('2024-01-15T11:00:00Z');

    // Act
    const discrepancyLog = detectDiscrepancy(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter,
      executionTime
    );

    // Assert
    expect(discrepancyLog.discrepancyType).toBe('警告ズレ');
    expect(discrepancyLog.dealId).toBe('DEAL-001');
    expect(discrepancyLog.invoiceId).toBe('INV-001');
    expect(discrepancyLog.dealAmount).toBe(1000000);
    expect(discrepancyLog.invoiceAmount).toBe(1050000);
    expect(discrepancyLog.amountDifference).toBe(50000);
    expect(discrepancyLog.discrepancyRate).toBe(6.25);
    expect(discrepancyLog.detectedAt).toBe(executionTime.toISOString());
    expect(discrepancyLog.status).toBe('未解決');
    expect(discrepancyLog.warningMessage).toBe(
      '警告：商談と請求書の金額ズレが許容範囲を超えています（ズレ率6.25%）'
    );
  });
});