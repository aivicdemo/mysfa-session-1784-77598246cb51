import { validateMigrationDataConsistency } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-308
  test('移行後データ一貫性検証機能 - Salesforceから自社システムへ移行されたデータが、売上実績と請求状況で完全に照合される', () => {
    const migrationStartDate = new Date('2023-01-01T00:00:00Z');
    const migrationEndDate = new Date('2024-01-01T00:00:00Z');
    const targetPeriodStart = new Date('2023-01-01T00:00:00Z');
    const targetPeriodEnd = new Date('2023-12-31T23:59:59Z');

    const salesRevenue = [
      {
        id: 'sr-001',
        dealId: 'deal-001',
        customerId: 'cust-001',
        amount: 150000,
        quantity: 1,
        recordedDate: new Date('2023-06-15T10:30:00Z'),
        status: '受注',
      },
      {
        id: 'sr-002',
        dealId: 'deal-002',
        customerId: 'cust-002',
        amount: 250000,
        quantity: 2,
        recordedDate: new Date('2023-07-20T14:15:00Z'),
        status: '受注',
      },
      {
        id: 'sr-003',
        dealId: 'deal-003',
        customerId: 'cust-003',
        amount: 100000,
        quantity: 1,
        recordedDate: new Date('2023-08-10T09:45:00Z'),
        status: '受注',
      },
    ];

    const billingStatus = [
      {
        id: 'bill-001',
        dealId: 'deal-001',
        customerId: 'cust-001',
        amount: 150000,
        quantity: 1,
        invoiceDate: new Date('2023-06-16T08:00:00Z'),
        status: '請求済み',
      },
      {
        id: 'bill-002',
        dealId: 'deal-002',
        customerId: 'cust-002',
        amount: 250000,
        quantity: 2,
        invoiceDate: new Date('2023-07-21T08:00:00Z'),
        status: '請求済み',
      },
      {
        id: 'bill-003',
        dealId: 'deal-003',
        customerId: 'cust-003',
        amount: 100000,
        quantity: 1,
        invoiceDate: new Date('2023-08-11T08:00:00Z'),
        status: '請求済み',
      },
    ];

    const result = validateMigrationDataConsistency({
      targetPeriodStart,
      targetPeriodEnd,
      salesRevenue,
      billingStatus,
    });

    expect(result.totalSalesRecords).toBe(3);
    expect(result.totalBillingRecords).toBe(3);
    expect(result.totalSalesAmount).toBe(500000);
    expect(result.totalBillingAmount).toBe(500000);
    expect(result.matchedCount).toBe(3);
    expect(result.unmatchedCount).toBe(0);
    expect(result.reconciliationRate).toBe(100);
    expect(result.isCompletelyReconciled).toBe(true);
    expect(result.mismatches).toHaveLength(0);
    expect(result.amountDifference).toBe(0);
  });
});