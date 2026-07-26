import { detectDelayedBillingIssues } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-258
  test('売上計上予定日が請求日より30日以上遅延している場合に遅延案件として検出される', () => {
    const billingDate = new Date('2024-01-01T00:00:00Z');
    const earliestAccrualDate = new Date('2024-01-31T00:00:00Z');
    const latestAccrualDate = new Date('2024-02-15T00:00:00Z');

    const salesData = [
      {
        dealId: 'DEAL001',
        customerId: 'CUST001',
        billingDate: billingDate,
        plannedAccrualDate: earliestAccrualDate,
        amount: 500000,
        status: 'completed'
      },
      {
        dealId: 'DEAL002',
        customerId: 'CUST002',
        billingDate: billingDate,
        plannedAccrualDate: latestAccrualDate,
        amount: 300000,
        status: 'completed'
      },
      {
        dealId: 'DEAL003',
        customerId: 'CUST003',
        billingDate: new Date('2024-01-05T00:00:00Z'),
        plannedAccrualDate: new Date('2024-01-10T00:00:00Z'),
        amount: 200000,
        status: 'completed'
      }
    ];

    const result = detectDelayedBillingIssues(salesData);

    expect(result).toEqual({
      delayedIssues: [
        {
          dealId: 'DEAL001',
          customerId: 'CUST001',
          billingDate: billingDate,
          plannedAccrualDate: earliestAccrualDate,
          delayDays: 30,
          isDelayed: true,
          amount: 500000
        },
        {
          dealId: 'DEAL002',
          customerId: 'CUST002',
          billingDate: billingDate,
          plannedAccrualDate: latestAccrualDate,
          delayDays: 45,
          isDelayed: true,
          amount: 300000
        }
      ],
      totalDelayedCount: 2,
      totalDelayedAmount: 800000,
      detectionTimestamp: expect.any(Date)
    });

    expect(result.delayedIssues[0].isDelayed).toBe(true);
    expect(result.delayedIssues[0].delayDays).toBe(30);
    expect(result.delayedIssues[1].isDelayed).toBe(true);
    expect(result.delayedIssues[1].delayDays).toBe(45);
    expect(result.totalDelayedCount).toBe(2);
    expect(result.totalDelayedAmount).toBe(800000);
  });
});