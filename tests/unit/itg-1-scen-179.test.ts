import { aggregateDealProgressByCustomer } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-179
  test('顧客別商談進捗集計機能 - 失注ステータスの商談件数が複数件のとき、その件数が正確に集計される', () => {
    const deals = [
      {
        deal_id: 'DEAL-001',
        customer_id: 'CUST-100',
        status: '失注',
        amount: 0,
      },
      {
        deal_id: 'DEAL-002',
        customer_id: 'CUST-100',
        status: '失注',
        amount: 0,
      },
      {
        deal_id: 'DEAL-003',
        customer_id: 'CUST-100',
        status: '失注',
        amount: 0,
      },
      {
        deal_id: 'DEAL-004',
        customer_id: 'CUST-200',
        status: '受注',
        amount: 100000,
      },
    ];

    const result = aggregateDealProgressByCustomer(deals);

    const cust100_result = result.find(
      (r) => r.customer_id === 'CUST-100'
    );

    expect(cust100_result).toBeDefined();
    expect(cust100_result?.status_breakdown).toBeDefined();

    const lostDealCount =
      cust100_result?.status_breakdown?.['失注']?.count ?? 0;
    expect(lostDealCount).toBe(3);

    const lostDeals =
      cust100_result?.status_breakdown?.['失注']?.deals ?? [];
    expect(lostDeals.length).toBe(3);
    expect(lostDeals.every((d) => d.status === '失注')).toBe(true);

    const allStatuses = Object.keys(cust100_result?.status_breakdown ?? {});
    expect(allStatuses).toContain('失注');

    const otherStatuses = allStatuses.filter((s) => s !== '失注');
    otherStatuses.forEach((status) => {
      expect(
        (cust100_result?.status_breakdown?.[status]?.count ?? 0)
      ).toBe(0);
    });
  });
});