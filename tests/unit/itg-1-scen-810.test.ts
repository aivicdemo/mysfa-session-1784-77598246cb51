import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  test('SCEN-810: 請求対象データ妥当性検証機能 - 請求明細が1行のとき、その1行を金額検証対象にする', () => {
    const invoice_data = {
      invoice_id: 'INV-2024-001',
      customer_id: 'CUST-001',
      customer_name: '山田株式会社',
      invoice_date: '2024-01-15',
      invoice_lines: [
        {
          line_number: 1,
          product_name: '商品A',
          quantity: 1,
          unit_price: 10000,
          subtotal: 10000,
        },
      ],
      total_amount: 10000,
    };

    const result = validateInvoiceData(invoice_data);

    expect(result.is_valid).toBe(true);
    expect(result.validation_target_line_count).toBe(1);
    expect(result.validation_target_amount).toBe(10000);
    expect(result.target_lines).toEqual([
      {
        line_number: 1,
        product_name: '商品A',
        quantity: 1,
        unit_price: 10000,
        subtotal: 10000,
      },
    ]);
    expect(result.errors).toEqual([]);
  });
});