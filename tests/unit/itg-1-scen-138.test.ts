import { flagUnbilledAndDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-138: [error] 未請求・遅延案件の自動フラグ付与 - 商談ステータスが『受注』以外の案件にはフラグが付与されない
  test('商談ステータスが受注以外の案件にはフラグが付与されない', () => {
    const deals = [
      {
        dealId: 'DEAL-001',
        customerId: 'CUST-001',
        dealName: '提案中案件',
        status: '提案中',
        amount: 500000,
        billingStatus: '未請求',
        createdDate: new Date('2024-01-01T09:00:00Z'),
        expectedBillingDate: new Date('2024-02-15T09:00:00Z'),
        actualBillingDate: null,
        unbilledFlag: false,
        delayedFlag: false,
      },
      {
        dealId: 'DEAL-002',
        customerId: 'CUST-002',
        dealName: '失注案件',
        status: '失注',
        amount: 300000,
        billingStatus: '未請求',
        createdDate: new Date('2024-01-01T09:00:00Z'),
        expectedBillingDate: new Date('2024-02-15T09:00:00Z'),
        actualBillingDate: null,
        unbilledFlag: false,
        delayedFlag: false,
      },
      {
        dealId: 'DEAL-003',
        customerId: 'CUST-003',
        dealName: '保留中案件',
        status: '保留中',
        amount: 200000,
        billingStatus: '未請求',
        createdDate: new Date('2024-01-01T09:00:00Z'),
        expectedBillingDate: new Date('2024-02-15T09:00:00Z'),
        actualBillingDate: null,
        unbilledFlag: false,
        delayedFlag: false,
      },
      {
        dealId: 'DEAL-004',
        customerId: 'CUST-004',
        dealName: '検討中案件',
        status: '検討中',
        amount: 150000,
        billingStatus: '未請求',
        createdDate: new Date('2024-01-01T09:00:00Z'),
        expectedBillingDate: new Date('2024-02-15T09:00:00Z'),
        actualBillingDate: null,
        unbilledFlag: false,
        delayedFlag: false,
      },
      {
        dealId: 'DEAL-005',
        customerId: 'CUST-005',
        dealName: '受注案件',
        status: '受注',
        amount: 1000000,
        billingStatus: '未請求',
        createdDate: new Date('2024-01-01T09:00:00Z'),
        expectedBillingDate: new Date('2024-02-15T09:00:00Z'),
        actualBillingDate: null,
        unbilledFlag: false,
        delayedFlag: false,
      },
    ];

    const currentDate = new Date('2024-03-20T09:00:00Z');

    const result = flagUnbilledAndDelayedDeals(deals, currentDate);

    // ステータス『提案中』の案件にはフラグが付与されないこと
    const proposalDeal = result.find((d) => d.dealId === 'DEAL-001');
    expect(proposalDeal).toBeDefined();
    expect(proposalDeal?.unbilledFlag).toBe(false);
    expect(proposalDeal?.delayedFlag).toBe(false);

    // ステータス『失注』の案件にはフラグが付与されないこと
    const lostDeal = result.find((d) => d.dealId === 'DEAL-002');
    expect(lostDeal).toBeDefined();
    expect(lostDeal?.unbilledFlag).toBe(false);
    expect(lostDeal?.delayedFlag).toBe(false);

    // ステータス『保留中』の案件にはフラグが付与されないこと
    const holdDeal = result.find((d) => d.dealId === 'DEAL-003');
    expect(holdDeal).toBeDefined();
    expect(holdDeal?.unbilledFlag).toBe(false);
    expect(holdDeal?.delayedFlag).toBe(false);

    // ステータス『検討中』の案件にはフラグが付与されないこと
    const considerationDeal = result.find((d) => d.dealId === 'DEAL-004');
    expect(considerationDeal).toBeDefined();
    expect(considerationDeal?.unbilledFlag).toBe(false);
    expect(considerationDeal?.delayedFlag).toBe(false);

    // ステータス『受注』の案件には、請求が遅延している場合、フラグが付与されること
    const orderedDeal = result.find((d) => d.dealId === 'DEAL-005');
    expect(orderedDeal).toBeDefined();
    expect(orderedDeal?.unbilledFlag).toBe(true);
    expect(orderedDeal?.delayedFlag).toBe(true);
  });
});