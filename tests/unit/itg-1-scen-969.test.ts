import { describe, test, expect } from '@jest/globals';
import { reconcileSalesAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-969: 売上実績の金額が0の場合、請求書の金額0との照合が正常に実行される', () => {
    // Arrange
    const salesRecord = {
      id: 'sales-001',
      amount: 0,
      recordedDate: '2024-01-15T10:00:00Z',
      dealId: 'deal-001',
    };

    const invoiceRecord = {
      id: 'invoice-001',
      amount: 0,
      issuedDate: '2024-01-15T10:30:00Z',
      dealId: 'deal-001',
    };

    // Act
    const reconciliationResult = reconcileSalesAndInvoice(salesRecord, invoiceRecord);

    // Assert
    expect(reconciliationResult.status).toBe('一致');
    expect(reconciliationResult.matchingAmount).toBe(0);
    expect(reconciliationResult.discrepancyAmount).toBe(0);
    expect(reconciliationResult.isMatched).toBe(true);
  });
});