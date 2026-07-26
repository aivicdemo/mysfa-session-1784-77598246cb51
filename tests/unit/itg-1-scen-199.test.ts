import { extractBillingTargetDeals } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-199
  test('請求タイプ判定と請求対象商談の自動抽出機能 - 営業担当者が請求実行ボタンをクリックした際、該当商談レコードが抽出対象として確定される', () => {
    const target_period_start = '2024-04-01';
    const target_period_end = '2024-04-30';
    const billing_type = 'monthly';
    const status_filter = 'won';
    const min_amount = 0;

    const input_deals = [
      {
        deal_id: 'DEAL001',
        customer_id: 'CUST001',
        customer_name: 'Company A',
        amount: 100000,
        status: 'won',
        deal_date: '2024-04-10',
        billing_status: 'unbilled',
      },
      {
        deal_id: 'DEAL002',
        customer_id: 'CUST002',
        customer_name: 'Company B',
        amount: 250000,
        status: 'won',
        deal_date: '2024-04-15',
        billing_status: 'unbilled',
      },
      {
        deal_id: 'DEAL003',
        customer_id: 'CUST003',
        customer_name: 'Company C',
        amount: 75000,
        status: 'in_negotiation',
        deal_date: '2024-04-20',
        billing_status: 'unbilled',
      },
      {
        deal_id: 'DEAL004',
        customer_id: 'CUST001',
        customer_name: 'Company A',
        amount: 150000,
        status: 'won',
        deal_date: '2024-04-25',
        billing_status: 'unbilled',
      },
      {
        deal_id: 'DEAL005',
        customer_id: 'CUST004',
        customer_name: 'Company D',
        amount: 200000,
        status: 'won',
        deal_date: '2024-03-30',
        billing_status: 'unbilled',
      },
    ];

    const result = extractBillingTargetDeals({
      target_period_start,
      target_period_end,
      billing_type,
      status_filter,
      min_amount,
      deals: input_deals,
    });

    expect(result.extracted_deals.length).toBe(3);
    expect(result.extracted_deals[0].deal_id).toBe('DEAL001');
    expect(result.extracted_deals[1].deal_id).toBe('DEAL002');
    expect(result.extracted_deals[2].deal_id).toBe('DEAL004');

    expect(result.extracted_deals[0].billing_status).toBe('confirmed');
    expect(result.extracted_deals[1].billing_status).toBe('confirmed');
    expect(result.extracted_deals[2].billing_status).toBe('confirmed');

    expect(result.total_billing_amount).toBe(500000);
    expect(result.extraction_count).toBe(3);
    expect(result.billing_type).toBe('monthly');
    expect(result.extraction_datetime).toBeDefined();
  });
});