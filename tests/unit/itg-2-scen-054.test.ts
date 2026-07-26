import { validateReportData } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 報告書データ検証機能', () => {
  // SCEN-054
  test('報告書の売上が元データより1円少ない場合、ズレが検出される', () => {
    const sourceRevenue = 100000;
    const reportRevenue = 99999;
    const expectedDiscrepancy = -1;

    const sourceReportData = {
      customerId: 'CUST-001',
      reportPeriod: '2024-01',
      totalRevenue: sourceRevenue,
      dealCount: 5,
      progressRate: 75,
      details: [
        {
          dealId: 'DEAL-001',
          dealName: 'Project A',
          status: 'Won',
          amount: 50000,
        },
        {
          dealId: 'DEAL-002',
          dealName: 'Project B',
          status: 'Won',
          amount: 50000,
        },
      ],
    };

    const reportDataToValidate = {
      customerId: 'CUST-001',
      reportPeriod: '2024-01',
      totalRevenue: reportRevenue,
      dealCount: 5,
      progressRate: 75,
      details: [
        {
          dealId: 'DEAL-001',
          dealName: 'Project A',
          status: 'Won',
          amount: 50000,
        },
        {
          dealId: 'DEAL-002',
          dealName: 'Project B',
          status: 'Won',
          amount: 49999,
        },
      ],
    };

    const validationResult = validateReportData(
      sourceReportData,
      reportDataToValidate
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.status).toBe('error');
    expect(validationResult.discrepancyDetected).toBe(true);
    expect(validationResult.discrepancyDetails.revenueDifference).toBe(
      expectedDiscrepancy
    );
    expect(validationResult.discrepancyDetails.direction).toBe('shortage');
    expect(validationResult.discrepancyDetails.sourceValue).toBe(
      sourceRevenue
    );
    expect(validationResult.discrepancyDetails.reportValue).toBe(reportRevenue);
    expect(validationResult.message).toMatch(/売上/);
  });
});