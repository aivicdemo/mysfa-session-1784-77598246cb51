import { generateDocuments } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-092
  test('商談金額が0円の場合、帳票生成対象から除外される', () => {
    const deal_id = 'DEAL-20250126-001';
    const customer_id = 'CUST-00123';
    const deal_amount = 0;
    const deal_status = '成約';
    const customer_name = 'テスト顧客株式会社';
    const customer_contact = 'contact@test-customer.jp';
    const deal_title = 'クラウドソリューション導入';
    const line_items = [
      {
        item_id: 'ITEM-001',
        item_name: 'ライセンス料',
        quantity: 0,
        unit_price: 0,
        line_total: 0,
      },
    ];
    const tax_rate = 0.1;
    const issue_date = new Date('2025-01-26T10:00:00Z');
    const system_time = new Date('2025-01-26T10:30:00Z');

    const input_deal = {
      deal_id,
      customer_id,
      deal_amount,
      deal_status,
      customer_name,
      customer_contact,
      deal_title,
      line_items,
      tax_rate,
      issue_date,
    };

    const result = generateDocuments(input_deal, system_time);

    expect(result.quotation_generated).toBe(false);
    expect(result.purchase_order_generated).toBe(false);
    expect(result.invoice_generated).toBe(false);
    expect(result.generated_documents).toEqual([]);
    expect(result.exclusion_reason).toBe('zero_amount');
    expect(result.system_log_entry).toMatch(/DEAL-20250126-001/);
    expect(result.system_log_entry).toMatch(/除外/);
    expect(result.deal_status_after_processing).toBe('成約');
  });
});