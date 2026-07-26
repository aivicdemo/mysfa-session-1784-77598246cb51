import { generateDocuments } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 帳票自動生成機能', () => {
  // SCEN-075
  test('商談金額が0円の場合でも、商談ステータス『成約』で帳票が生成される', () => {
    const deal_record = {
      deal_id: 'DEAL-00001',
      customer_name: 'テスト顧客A',
      deal_amount: 0,
      deal_status: '成約',
      deal_date: '2024-01-15',
      line_items: [
        {
          item_id: 'ITEM-001',
          product_name: '商品A',
          quantity: 1,
          unit_price: 0,
          total_price: 0,
        },
      ],
    };

    const result = generateDocuments(deal_record);

    expect(result).toEqual({
      quote_generated: true,
      order_generated: true,
      invoice_generated: true,
      quote_file: {
        filename: 'DEAL-00001_quote.pdf',
        format: 'pdf',
        deal_amount: 0,
        deal_status: '成約',
      },
      order_file: {
        filename: 'DEAL-00001_order.pdf',
        format: 'pdf',
        deal_amount: 0,
        deal_status: '成約',
      },
      invoice_file: {
        filename: 'DEAL-00001_invoice.pdf',
        format: 'pdf',
        deal_amount: 0,
        deal_status: '成約',
      },
    });

    expect(result.quote_generated).toBe(true);
    expect(result.order_generated).toBe(true);
    expect(result.invoice_generated).toBe(true);
    expect(result.quote_file.deal_amount).toBe(0);
    expect(result.order_file.deal_amount).toBe(0);
    expect(result.invoice_file.deal_amount).toBe(0);
    expect(result.quote_file.deal_status).toBe('成約');
    expect(result.order_file.deal_status).toBe('成約');
    expect(result.invoice_file.deal_status).toBe('成約');
    expect(result.quote_file.format).toBe('pdf');
    expect(result.order_file.format).toBe('pdf');
    expect(result.invoice_file.format).toBe('pdf');
  });
});