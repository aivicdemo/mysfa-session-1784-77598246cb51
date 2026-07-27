import { extractInvoiceTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-779
  test('should throw ValidationError when period start date is empty', () => {
    const extractionCondition = {
      periodStartDate: '',
      periodEndDate: '2024-04-30',
      targetCustomerIds: ['CUST001'],
      statusFilter: ['受注'],
    };

    expect(() => extractInvoiceTargetData(extractionCondition)).toThrow(/期間開始日/);
  });
});