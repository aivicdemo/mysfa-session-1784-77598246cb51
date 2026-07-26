import { validateInvoiceContent } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-100
  test('顧客ポータル請求内容検証機能 - 請求書の金額・明細・税額が顧客期待値と一致する場合、検証完了と判定される', () => {
    const invoice_data = {
      invoice_id: 'INV-2024-001',
      customer_id: 'CUST-12345',
      invoice_date: '2024-01-15',
      total_amount: 110000,
      subtotal_amount: 100000,
      tax_amount: 10000,
      tax_rate: 0.1,
      line_items: [
        {
          line_id: 'LINE-001',
          product_name: 'Product A',
          quantity: 10,
          unit_price: 5000,
          line_total: 50000,
        },
        {
          line_id: 'LINE-002',
          product_name: 'Product B',
          quantity: 10,
          unit_price: 5000,
          line_total: 50000,
        },
      ],
    };

    const customer_expected_values = {
      expected_total_amount: 110000,
      expected_subtotal_amount: 100000,
      expected_tax_amount: 10000,
      expected_tax_rate: 0.1,
      expected_line_item_count: 2,
      expected_line_items: [
        {
          line_id: 'LINE-001',
          product_name: 'Product A',
          quantity: 10,
          unit_price: 5000,
          line_total: 50000,
        },
        {
          line_id: 'LINE-002',
          product_name: 'Product B',
          quantity: 10,
          unit_price: 5000,
          line_total: 50000,
        },
      ],
    };

    const validation_result = validateInvoiceContent(
      invoice_data,
      customer_expected_values
    );

    expect(validation_result.validation_status).toBe('検証完了');
    expect(validation_result.is_amount_match).toBe(true);
    expect(validation_result.is_tax_match).toBe(true);
    expect(validation_result.is_line_items_match).toBe(true);
    expect(validation_result.discrepancy_flag).toBe(false);
    expect(validation_result.total_amount_actual).toBe(110000);
    expect(validation_result.total_amount_expected).toBe(110000);
    expect(validation_result.tax_amount_actual).toBe(10000);
    expect(validation_result.tax_amount_expected).toBe(10000);
    expect(validation_result.line_item_count_actual).toBe(2);
    expect(validation_result.line_item_count_expected).toBe(2);
  });
});