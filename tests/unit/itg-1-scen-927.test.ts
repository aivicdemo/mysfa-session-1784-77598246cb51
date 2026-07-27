import { detectDelayedCases } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求データ照合機能 - 遅延案件検出', () => {
  // SCEN-927
  test('売上計上予定日が請求日より1日後の場合、遅延案件として検出される', () => {
    const invoiceDate = new Date('2024-01-15T00:00:00Z');
    const plannedRevenueDate = new Date('2024-01-16T00:00:00Z');

    const testCaseRecords = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-A01',
        dealStatus: '受注',
        invoiceAmount: 500000,
        invoiceIssuedDate: invoiceDate,
        plannedRevenueRecognitionDate: plannedRevenueDate,
        invoiceIsIssued: true,
      },
    ];

    const result = detectDelayedCases(testCaseRecords);

    expect(result.delayedCases).toHaveLength(1);
    expect(result.delayedCases[0]).toEqual({
      dealId: 'DEAL-001',
      customerId: 'CUST-A01',
      isDelayedFlag: true,
      delayClassification: '1日遅延',
      delayDays: 1,
      invoiceIssuedDate: invoiceDate,
      plannedRevenueRecognitionDate: plannedRevenueDate,
      invoiceAmount: 500000,
    });
  });
});