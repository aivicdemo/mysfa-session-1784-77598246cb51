import { detectSalesInvoiceMismatch } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  test('SCEN-958: 売上実績の記録日付が請求書の発行日付より1日早い場合、日付ズレが不整合として検出される', () => {
    // Arrange
    const salesRecordDate = '2024-01-15';
    const invoiceIssueDate = '2024-01-16';
    const transactionId = 'TXN-20240115-001';
    const customerId = 'CUST-12345';
    const amount = 100000;

    const salesRecord = {
      id: `SR-${transactionId}`,
      transactionId,
      customerId,
      amount,
      recordDate: salesRecordDate,
      status: 'completed'
    };

    const invoiceRecord = {
      id: `INV-${transactionId}`,
      transactionId,
      customerId,
      amount,
      issueDate: invoiceIssueDate,
      status: 'issued'
    };

    // Act
    const mismatchResult = detectSalesInvoiceMismatch({
      salesRecord,
      invoiceRecord
    });

    // Assert
    expect(mismatchResult.hasMismatch).toBe(true);
    expect(mismatchResult.mismatchType).toBe('DateMismatch');
    expect(mismatchResult.mismatchDetail).toBe('SalesRecordDateIsEarlierThanInvoiceDateBy1Day');
    expect(mismatchResult.targetTransactionId).toBe(transactionId);
    expect(mismatchResult.dateDifferenceDays).toBe(1);
  });
});