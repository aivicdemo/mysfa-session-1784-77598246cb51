import { extractDealDataByConditions } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-203
  test('抽出条件による請求対象データの絞り込み機能 - ステータス・金額・期間の抽出条件に完全に合致する商談成約データが抽出される', () => {
    const deal_data_list = [
      {
        deal_id: 'DEAL001',
        customer_id: 'CUST001',
        customer_name: 'ABC Corporation',
        deal_amount: 1500000,
        deal_status: '成約',
        deal_date: new Date('2024-02-15T10:00:00Z'),
      },
      {
        deal_id: 'DEAL002',
        customer_id: 'CUST002',
        customer_name: 'XYZ Inc',
        deal_amount: 3000000,
        deal_status: '成約',
        deal_date: new Date('2024-01-20T14:30:00Z'),
      },
      {
        deal_id: 'DEAL003',
        customer_id: 'CUST003',
        customer_name: 'DEF Ltd',
        deal_amount: 800000,
        deal_status: '成約',
        deal_date: new Date('2024-03-10T09:15:00Z'),
      },
      {
        deal_id: 'DEAL004',
        customer_id: 'CUST004',
        customer_name: 'GHI Co',
        deal_amount: 5500000,
        deal_status: '成約',
        deal_date: new Date('2024-02-28T16:45:00Z'),
      },
      {
        deal_id: 'DEAL005',
        customer_id: 'CUST005',
        customer_name: 'JKL Group',
        deal_amount: 2500000,
        deal_status: '提案中',
        deal_date: new Date('2024-02-05T11:00:00Z'),
      },
      {
        deal_id: 'DEAL006',
        customer_id: 'CUST006',
        customer_name: 'MNO Partners',
        deal_amount: 2000000,
        deal_status: '成約',
        deal_date: new Date('2024-04-15T13:20:00Z'),
      },
      {
        deal_id: 'DEAL007',
        customer_id: 'CUST007',
        customer_name: 'PQR Solutions',
        deal_amount: 4000000,
        deal_status: '成約',
        deal_date: new Date('2024-03-25T10:10:00Z'),
      },
    ];

    const extraction_criteria = {
      status_filter: '成約',
      min_amount: 1000000,
      max_amount: 5000000,
      start_date: new Date('2024-01-01T00:00:00Z'),
      end_date: new Date('2024-03-31T23:59:59Z'),
    };

    const result = extractDealDataByConditions(deal_data_list, extraction_criteria);

    expect(result).toEqual([
      {
        deal_id: 'DEAL001',
        customer_id: 'CUST001',
        customer_name: 'ABC Corporation',
        deal_amount: 1500000,
        deal_status: '成約',
        deal_date: new Date('2024-02-15T10:00:00Z'),
      },
      {
        deal_id: 'DEAL002',
        customer_id: 'CUST002',
        customer_name: 'XYZ Inc',
        deal_amount: 3000000,
        deal_status: '成約',
        deal_date: new Date('2024-01-20T14:30:00Z'),
      },
      {
        deal_id: 'DEAL007',
        customer_id: 'CUST007',
        customer_name: 'PQR Solutions',
        deal_amount: 4000000,
        deal_status: '成約',
        deal_date: new Date('2024-03-25T10:10:00Z'),
      },
    ]);

    expect(result.length).toBe(3);

    result.forEach((deal) => {
      expect(deal.deal_status).toBe('成約');
      expect(deal.deal_amount).toBeGreaterThanOrEqual(1000000);
      expect(deal.deal_amount).toBeLessThanOrEqual(5000000);
      expect(deal.deal_date.getTime()).toBeGreaterThanOrEqual(
        extraction_criteria.start_date.getTime()
      );
      expect(deal.deal_date.getTime()).toBeLessThanOrEqual(
        extraction_criteria.end_date.getTime()
      );
    });
  });
});