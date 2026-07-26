import { detectOverdueBillingCases } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-171
  test('商談ステータスが「完了」かつ請求予定日を超過した案件が遅延案件リストに含まれる', () => {
    const today = new Date('2024-04-15T00:00:00Z');
    const systemCurrentDate = new Date('2024-04-15T00:00:00Z');

    const dealRecords = [
      {
        dealId: 'DEAL001',
        customerId: 'CUST001',
        customerName: '顧客A',
        status: '完了',
        amount: 100000,
        billingScheduledDate: new Date('2024-04-10T00:00:00Z'),
        billingIssuedDate: null,
        billingAmount: null,
      },
      {
        dealId: 'DEAL002',
        customerId: 'CUST002',
        customerName: '顧客B',
        status: '受注',
        amount: 50000,
        billingScheduledDate: new Date('2024-04-20T00:00:00Z'),
        billingIssuedDate: null,
        billingAmount: null,
      },
      {
        dealId: 'DEAL003',
        customerId: 'CUST001',
        customerName: '顧客A',
        status: '完了',
        amount: 75000,
        billingScheduledDate: new Date('2024-04-08T00:00:00Z'),
        billingIssuedDate: null,
        billingAmount: null,
      },
      {
        dealId: 'DEAL004',
        customerId: 'CUST003',
        customerName: '顧客C',
        status: '完了',
        amount: 120000,
        billingScheduledDate: new Date('2024-04-16T00:00:00Z'),
        billingIssuedDate: null,
        billingAmount: null,
      },
      {
        dealId: 'DEAL005',
        customerId: 'CUST004',
        customerName: '顧客D',
        status: '完了',
        amount: 30000,
        billingScheduledDate: new Date('2024-04-12T00:00:00Z'),
        billingIssuedDate: new Date('2024-04-14T00:00:00Z'),
        billingAmount: 30000,
      },
    ];

    const result = detectOverdueBillingCases(
      dealRecords,
      systemCurrentDate
    );

    expect(result).toEqual({
      overdueCount: 2,
      overdueCases: [
        {
          dealId: 'DEAL001',
          customerId: 'CUST001',
          customerName: '顧客A',
          status: '完了',
          amount: 100000,
          billingScheduledDate: new Date('2024-04-10T00:00:00Z'),
          billingIssuedDate: null,
          billingAmount: null,
          daysOverdue: 5,
        },
        {
          dealId: 'DEAL003',
          customerId: 'CUST001',
          customerName: '顧客A',
          status: '完了',
          amount: 75000,
          billingScheduledDate: new Date('2024-04-08T00:00:00Z'),
          billingIssuedDate: null,
          billingAmount: null,
          daysOverdue: 7,
        },
      ],
      detectionTimestamp: systemCurrentDate,
    });

    expect(result.overdueCases[0].daysOverdue).toBe(5);
    expect(result.overdueCases[1].daysOverdue).toBe(7);
    expect(result.overdueCount).toBe(2);
  });
});