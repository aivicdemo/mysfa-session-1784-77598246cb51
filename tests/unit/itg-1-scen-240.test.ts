import { extractDealData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-240
  test('請求対象データ抽出機能 - 指定ステータス・金額・期間条件に合致する商談成約データが正常に抽出される', () => {
    const input_deals = [
      {
        deal_id: 'DEAL001',
        customer_id: 'CUST001',
        status: '成約済み',
        amount: 1500000,
        deal_date: '2024-01-15',
        contract_date: '2024-01-20',
      },
      {
        deal_id: 'DEAL002',
        customer_id: 'CUST002',
        status: '成約済み',
        amount: 2000000,
        deal_date: '2024-02-10',
        contract_date: '2024-02-15',
      },
      {
        deal_id: 'DEAL003',
        customer_id: 'CUST003',
        status: '成約済み',
        amount: 800000,
        deal_date: '2024-01-05',
        contract_date: '2024-01-10',
      },
      {
        deal_id: 'DEAL004',
        customer_id: 'CUST004',
        status: '提案中',
        amount: 1200000,
        deal_date: '2024-02-20',
        contract_date: null,
      },
      {
        deal_id: 'DEAL005',
        customer_id: 'CUST005',
        status: '成約済み',
        amount: 1800000,
        deal_date: '2024-03-25',
        contract_date: '2024-03-28',
      },
      {
        deal_id: 'DEAL006',
        customer_id: 'CUST006',
        status: '成約済み',
        amount: 950000,
        deal_date: '2024-03-10',
        contract_date: '2024-03-12',
      },
      {
        deal_id: 'DEAL007',
        customer_id: 'CUST007',
        status: '成約済み',
        amount: 1100000,
        deal_date: '2024-04-05',
        contract_date: '2024-04-08',
      },
    ];

    const extraction_criteria = {
      status: '成約済み',
      min_amount: 1000000,
      period_start: '2024-01-01',
      period_end: '2024-03-31',
    };

    const result = extractDealData(input_deals, extraction_criteria);

    // ステータス『成約済み』、金額『100万円以上』、期間『2024年1月1日～2024年3月31日』に合致するデータは3件
    expect(result.extracted_count).toBe(3);

    // 抽出されたデータのIDリスト
    const extracted_deal_ids = result.deals.map((deal: any) => deal.deal_id);
    expect(extracted_deal_ids).toEqual(['DEAL001', 'DEAL002', 'DEAL005']);

    // 各抽出データのステータス確認
    result.deals.forEach((deal: any) => {
      expect(deal.status).toBe('成約済み');
    });

    // 各抽出データの金額が100万円以上であることを確認
    result.deals.forEach((deal: any) => {
      expect(deal.amount).toBeGreaterThanOrEqual(1000000);
    });

    // 各抽出データの契約日が指定期間内であることを確認
    result.deals.forEach((deal: any) => {
      const contract_date = new Date(deal.contract_date);
      const period_start = new Date('2024-01-01');
      const period_end = new Date('2024-03-31');
      expect(contract_date.getTime()).toBeGreaterThanOrEqual(period_start.getTime());
      expect(contract_date.getTime()).toBeLessThanOrEqual(period_end.getTime());
    });

    // 金額合計の検証: 1,500,000 + 2,000,000 + 1,800,000 = 5,300,000
    expect(result.total_amount).toBe(5300000);

    // 抽出結果に条件外データが含まれていないことを確認
    // DEAL003（800,000円は条件未満）、DEAL004（ステータスが提案中）、
    // DEAL006（950,000円は条件未満）、DEAL007（期間外）は含まれていない
    const excluded_deal_ids = ['DEAL003', 'DEAL004', 'DEAL006', 'DEAL007'];
    excluded_deal_ids.forEach((excluded_id: string) => {
      expect(extracted_deal_ids).not.toContain(excluded_id);
    });

    // データ形式の検証
    result.deals.forEach((deal: any) => {
      expect(deal).toHaveProperty('deal_id');
      expect(deal).toHaveProperty('customer_id');
      expect(deal).toHaveProperty('status');
      expect(deal).toHaveProperty('amount');
      expect(deal).toHaveProperty('contract_date');
      expect(typeof deal.deal_id).toBe('string');
      expect(typeof deal.customer_id).toBe('string');
      expect(typeof deal.status).toBe('string');
      expect(typeof deal.amount).toBe('number');
      expect(typeof deal.contract_date).toBe('string');
    });

    // 結果オブジェクトの構造確認
    expect(result).toHaveProperty('extracted_count');
    expect(result).toHaveProperty('total_amount');
    expect(result).toHaveProperty('deals');
    expect(Array.isArray(result.deals)).toBe(true);
  });
});