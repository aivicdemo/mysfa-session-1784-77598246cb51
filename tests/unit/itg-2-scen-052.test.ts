import { matchDealReconciliation } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 売上実績と請求状況の照合機能', () => {
  // SCEN-052
  test('請求書発行日が商談ステータス更新日と同日の場合、正常に照合される', () => {
    const dealStatusUpdateDate = new Date('2024-01-15T10:30:00Z');
    const invoiceIssuedDate = new Date('2024-01-15T14:45:00Z');
    const dealId = 'DEAL-20240115-001';
    const dealStatus = 'order_confirmed';
    const invoiceAmount = 150000;
    const dealAmount = 150000;
    const invoiceLineCount = 3;
    const dealLineCount = 3;

    const reconciliationResult = matchDealReconciliation({
      dealId,
      dealStatus,
      dealStatusUpdateDate,
      invoiceIssuedDate,
      dealAmount,
      invoiceAmount,
      dealLineCount,
      invoiceLineCount,
    });

    expect(reconciliationResult.reconciliationStatus).toBe('completed');
    expect(reconciliationResult.isSameDayIssue).toBe(true);
    expect(reconciliationResult.amountMatch).toBe(true);
    expect(reconciliationResult.lineCountMatch).toBe(true);
    expect(reconciliationResult.errorMessage).toBeNull();
    expect(reconciliationResult.isDiscrepancy).toBe(false);
    expect(reconciliationResult.dealId).toBe('DEAL-20240115-001');
    expect(reconciliationResult.daysOffset).toBe(0);
  });
});