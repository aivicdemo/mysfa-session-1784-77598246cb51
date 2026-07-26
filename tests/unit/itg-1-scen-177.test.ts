import { generateInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-177
  test('請求明細が0件の商談からは請求書が生成されないか、空白請求書となる', () => {
    const deal_id = 'DEAL-20240115-001';
    const customer_id = 'CUST-00001';
    const customer_name = '株式会社テスト';
    const deal_amount = 0;
    const invoice_line_items: Array<{
      line_item_id: string;
      product_id: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }> = [];

    const deal_data = {
      deal_id,
      customer_id,
      customer_name,
      deal_amount,
      invoice_line_items,
      deal_status: 'won',
    };

    const result = generateInvoice(deal_data);

    expect(result).toEqual({
      success: false,
      error_message: '請求対象となる明細がありません',
      invoice_id: null,
      invoice_amount: 0,
      invoice_line_count: 0,
    });
  });
});