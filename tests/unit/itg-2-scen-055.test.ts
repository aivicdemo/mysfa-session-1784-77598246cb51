import { validateReportData } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-055
  test('報告書データ検証機能 - 報告書の件数が元データより1件少ない場合、ズレが検出される', () => {
    const sourceDataRecords = [
      {
        id: 'deal_001',
        customerId: 'cust_A',
        amount: 1000000,
        status: '受注',
      },
      {
        id: 'deal_002',
        customerId: 'cust_B',
        amount: 500000,
        status: '受注',
      },
      {
        id: 'deal_003',
        customerId: 'cust_C',
        amount: 750000,
        status: '完了',
      },
      {
        id: 'deal_004',
        customerId: 'cust_D',
        amount: 250000,
        status: '受注',
      },
      {
        id: 'deal_005',
        customerId: 'cust_E',
        amount: 300000,
        status: '完了',
      },
    ];

    const reportDataRecords = [
      {
        id: 'deal_001',
        customerId: 'cust_A',
        amount: 1000000,
        status: '受注',
      },
      {
        id: 'deal_002',
        customerId: 'cust_B',
        amount: 500000,
        status: '受注',
      },
      {
        id: 'deal_003',
        customerId: 'cust_C',
        amount: 750000,
        status: '完了',
      },
      {
        id: 'deal_004',
        customerId: 'cust_D',
        amount: 250000,
        status: '受注',
      },
    ];

    const sourceDataCount = 5;
    const reportDataCount = 4;

    const result = validateReportData({
      sourceRecords: sourceDataRecords,
      reportRecords: reportDataRecords,
    });

    expect(result.isValid).toBe(false);
    expect(result.recordCountMismatch).toBe(true);
    expect(result.sourceRecordCount).toBe(sourceDataCount);
    expect(result.reportRecordCount).toBe(reportDataCount);
    expect(result.errorMessage).toMatch(/件数/);
    expect(result.errorMessage).toMatch(/元データ/);
    expect(result.errorMessage).toMatch(/報告書/);
  });
});