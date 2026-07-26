import { determineBillingExecutionTiming } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-093
  test('請求実行タイミング判定機能 - 請求タイプ『月次』の商談レコードが正確に抽出対象として確定される', () => {
    const dealRecords = [
      {
        id: 'deal-001',
        customerId: 'cust-001',
        billingType: 'monthly',
        amount: 100000,
        status: 'won',
        billingScheduledDate: '2024-01-31',
      },
      {
        id: 'deal-002',
        customerId: 'cust-002',
        billingType: 'monthly',
        amount: 50000,
        status: 'won',
        billingScheduledDate: '2024-01-31',
      },
      {
        id: 'deal-003',
        customerId: 'cust-003',
        billingType: 'oneTime',
        amount: 75000,
        status: 'won',
        billingScheduledDate: '2024-02-15',
      },
      {
        id: 'deal-004',
        customerId: 'cust-004',
        billingType: 'monthly',
        amount: 120000,
        status: 'won',
        billingScheduledDate: '2024-01-31',
      },
      {
        id: 'deal-005',
        customerId: 'cust-005',
        billingType: 'custom',
        amount: 200000,
        status: 'won',
        billingScheduledDate: '2024-03-10',
      },
    ];

    const executionTiming = 'monthly';
    const result = determineBillingExecutionTiming(dealRecords, executionTiming);

    expect(result.extractionTargets).toHaveLength(3);
    expect(result.extractionTargets.map((record) => record.id)).toEqual([
      'deal-001',
      'deal-002',
      'deal-004',
    ]);

    const monthlyRecords = result.extractionTargets;
    expect(monthlyRecords.every((record) => record.billingType === 'monthly')).toBe(true);

    const nonMonthlyIds = ['deal-003', 'deal-005'];
    const extractedIds = result.extractionTargets.map((record) => record.id);
    expect(nonMonthlyIds.some((id) => extractedIds.includes(id))).toBe(false);

    expect(result.billingType).toBe('monthly');
    expect(result.status).toBe('confirmed');
  });
});