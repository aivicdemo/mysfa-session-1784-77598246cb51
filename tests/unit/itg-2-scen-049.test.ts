import { identifyUnbilledDeals } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータルでの商談情報参照機能', () => {
  // SCEN-049
  test('売上実績と請求状況の照合機能 - 商談ステータスが受注だが請求書が発行されていない場合、未請求案件として特定される', () => {
    const deals = [
      {
        deal_id: 'DEAL001',
        deal_status: '受注',
        customer_id: 'CUST001',
        customer_name: '顧客A',
        deal_amount: 1000000,
        invoice_issued_date: null,
        invoice_id: null,
        expected_invoice_date: '2024-01-15',
      },
      {
        deal_id: 'DEAL002',
        deal_status: '受注',
        customer_id: 'CUST002',
        customer_name: '顧客B',
        deal_amount: 500000,
        invoice_issued_date: '2024-01-10',
        invoice_id: 'INV002',
        expected_invoice_date: '2024-01-15',
      },
      {
        deal_id: 'DEAL003',
        deal_status: '商談中',
        customer_id: 'CUST003',
        customer_name: '顧客C',
        deal_amount: 300000,
        invoice_issued_date: null,
        invoice_id: null,
        expected_invoice_date: '2024-02-15',
      },
    ];

    const result = identifyUnbilledDeals(deals);

    expect(result.unbilled_deals).toHaveLength(1);
    expect(result.unbilled_deals[0]).toEqual({
      deal_id: 'DEAL001',
      deal_status: '受注',
      customer_id: 'CUST001',
      customer_name: '顧客A',
      deal_amount: 1000000,
      invoice_issued_date: null,
      invoice_id: null,
      expected_invoice_date: '2024-01-15',
      is_unbilled: true,
      flagged_at: expect.any(String),
    });

    expect(result.unbilled_deals[0].deal_status).toBe('受注');
    expect(result.unbilled_deals[0].is_unbilled).toBe(true);
    expect(result.unbilled_deals[0].invoice_issued_date).toBeNull();

    expect(result.billed_deals).toHaveLength(1);
    expect(result.billed_deals[0].deal_id).toBe('DEAL002');
    expect(result.billed_deals[0].invoice_issued_date).toBe('2024-01-10');

    expect(result.excluded_deals).toHaveLength(1);
    expect(result.excluded_deals[0].deal_id).toBe('DEAL003');
    expect(result.excluded_deals[0].deal_status).toBe('商談中');

    expect(result.total_unbilled_amount).toBe(1000000);
    expect(result.unbilled_count).toBe(1);
  });
});