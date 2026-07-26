import { generateDocuments } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照と帳票自動生成', () => {
  // SCEN-074
  test('商談ステータスが成約でも顧客情報が不完全な場合、帳票生成がスキップされる', () => {
    const deal_record = {
      deal_id: 'DEAL-20240115-001',
      customer_id: 'CUST-2024-0001',
      status: '成約',
      amount: 500000,
      line_items: [
        {
          item_id: 'ITEM-001',
          product_name: 'SaaS License Annual',
          quantity: 1,
          unit_price: 500000,
          subtotal: 500000,
        },
      ],
    };

    const incomplete_customer_info = {
      customer_id: 'CUST-2024-0001',
      company_name: 'Test Company Inc.',
      contact_person: 'Taro Yamada',
      email: 'taro@testcompany.jp',
      phone_number: '',
      address: '',
      postal_code: '100-0001',
    };

    const result = generateDocuments(deal_record, incomplete_customer_info);

    expect(result.success).toBe(false);
    expect(result.error_message).toMatch(/顧客情報/);
    expect(result.documents_generated).toBe(false);
    expect(result.estimate_file).toBeUndefined();
    expect(result.order_file).toBeUndefined();
    expect(result.invoice_file).toBeUndefined();
  });
});