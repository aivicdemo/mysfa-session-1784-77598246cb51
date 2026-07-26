import { detectUnbilledAndDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-171
  test('商談ステータスが『受注』でも請求書が発行されていない案件が未請求案件として検出される', () => {
    const testDealData = [
      {
        deal_id: 'DEAL-001',
        customer_name: 'テスト顧客A',
        status: '受注',
        amount: 500000,
        invoice_issued_date: null,
        invoice_status: '未発行',
        expected_invoice_date: new Date('2024-01-15').toISOString(),
      },
      {
        deal_id: 'DEAL-002',
        customer_name: 'テスト顧客B',
        status: '受注',
        amount: 300000,
        invoice_issued_date: new Date('2024-01-10').toISOString(),
        invoice_status: '発行済',
        expected_invoice_date: new Date('2024-01-12').toISOString(),
      },
      {
        deal_id: 'DEAL-003',
        customer_name: 'テスト顧客C',
        status: '提案中',
        amount: 200000,
        invoice_issued_date: null,
        invoice_status: '未発行',
        expected_invoice_date: new Date('2024-02-01').toISOString(),
      },
      {
        deal_id: 'DEAL-004',
        customer_name: 'テスト顧客D',
        status: '受注',
        amount: 450000,
        invoice_issued_date: new Date('2024-01-05').toISOString(),
        invoice_status: '発行済',
        expected_invoice_date: new Date('2024-01-08').toISOString(),
      },
    ];

    const checkDate = new Date('2024-01-20T00:00:00Z');

    const result = detectUnbilledAndDelayedDeals(testDealData, checkDate);

    expect(result).toBeDefined();
    expect(result.unbilled_deals).toBeDefined();
    expect(result.delayed_deals).toBeDefined();

    const unbilledDeals = result.unbilled_deals;
    expect(unbilledDeals.length).toBe(1);
    expect(unbilledDeals[0].deal_id).toBe('DEAL-001');
    expect(unbilledDeals[0].customer_name).toBe('テスト顧客A');
    expect(unbilledDeals[0].status).toBe('受注');
    expect(unbilledDeals[0].amount).toBe(500000);
    expect(unbilledDeals[0].invoice_status).toBe('未発行');
    expect(unbilledDeals[0].invoice_issued_date).toBeNull();
    expect(unbilledDeals[0].expected_invoice_date).toBe(new Date('2024-01-15').toISOString());

    const dealDetail = result.unbilled_deals[0];
    expect(dealDetail.status).toBe('受注');
    expect(dealDetail.invoice_status).toBe('未発行');

    const delayedDeals = result.delayed_deals;
    expect(delayedDeals).toBeDefined();
    expect(Array.isArray(delayedDeals)).toBe(true);

    const allDetectedDealIds = [
      ...unbilledDeals.map((d: any) => d.deal_id),
      ...delayedDeals.map((d: any) => d.deal_id),
    ];
    expect(allDetectedDealIds.includes('DEAL-001')).toBe(true);

    expect(result.total_unbilled_amount).toBe(500000);

    expect(unbilledDeals.some((d: any) => d.deal_id === 'DEAL-002')).toBe(false);
    expect(unbilledDeals.some((d: any) => d.deal_id === 'DEAL-003')).toBe(false);
    expect(unbilledDeals.some((d: any) => d.deal_id === 'DEAL-004')).toBe(false);
  });
});