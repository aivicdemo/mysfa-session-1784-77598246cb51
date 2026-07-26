import { detectUnbilledAndDelayedCases } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-154: [error] 商談ステータス・請求データ紐付け照合機能 - 商談ステータスが『受注』で請求書が生成されていない場合、未請求案件として検出される
  test('ステータスが受注で請求書が生成されていない商談が未請求案件として検出される', () => {
    // Arrange
    const deal_1_received_no_invoice = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-A',
      customer_name: '株式会社A',
      deal_amount: 500000,
      deal_status: '受注',
      invoice_generated_date: null,
      invoice_id: null,
      invoice_amount: null,
      planned_invoice_date: '2024-04-15',
      actual_invoice_date: null,
    };

    const deal_2_received_with_invoice = {
      deal_id: 'DEAL-002',
      customer_id: 'CUST-B',
      customer_name: '株式会社B',
      deal_amount: 300000,
      deal_status: '受注',
      invoice_generated_date: '2024-04-10T09:30:00Z',
      invoice_id: 'INV-202404-001',
      invoice_amount: 300000,
      planned_invoice_date: '2024-04-15',
      actual_invoice_date: '2024-04-10',
    };

    const deal_3_other_status = {
      deal_id: 'DEAL-003',
      customer_id: 'CUST-C',
      customer_name: '株式会社C',
      deal_amount: 200000,
      deal_status: '提案中',
      invoice_generated_date: null,
      invoice_id: null,
      invoice_amount: null,
      planned_invoice_date: '2024-04-20',
      actual_invoice_date: null,
    };

    const deals = [deal_1_received_no_invoice, deal_2_received_with_invoice, deal_3_other_status];

    // Act
    const result = detectUnbilledAndDelayedCases({ deals, reference_date: '2024-04-16' });

    // Assert - 未請求案件の検出
    expect(result.unbilled_cases).toHaveLength(1);
    expect(result.unbilled_cases[0].deal_id).toBe('DEAL-001');
    expect(result.unbilled_cases[0].customer_id).toBe('CUST-A');
    expect(result.unbilled_cases[0].customer_name).toBe('株式会社A');
    expect(result.unbilled_cases[0].deal_amount).toBe(500000);
    expect(result.unbilled_cases[0].deal_status).toBe('受注');
    expect(result.unbilled_cases[0].invoice_generated_date).toBeNull();
    expect(result.unbilled_cases[0].case_type).toBe('unbilled');

    // Assert - 遅延案件は空
    expect(result.delayed_cases).toHaveLength(0);

    // Assert - 請求済み案件の確認
    expect(result.billed_cases).toHaveLength(1);
    expect(result.billed_cases[0].deal_id).toBe('DEAL-002');
    expect(result.billed_cases[0].invoice_id).toBe('INV-202404-001');

    // Assert - その他ステータス案件は対象外
    expect(result.out_of_scope_cases).toHaveLength(1);
    expect(result.out_of_scope_cases[0].deal_id).toBe('DEAL-003');
    expect(result.out_of_scope_cases[0].deal_status).toBe('提案中');

    // Assert - 総計
    expect(result.summary.total_deals).toBe(3);
    expect(result.summary.unbilled_count).toBe(1);
    expect(result.summary.delayed_count).toBe(0);
    expect(result.summary.billed_count).toBe(1);
    expect(result.summary.total_unbilled_amount).toBe(500000);
    expect(result.summary.total_delayed_amount).toBe(0);
  });
});