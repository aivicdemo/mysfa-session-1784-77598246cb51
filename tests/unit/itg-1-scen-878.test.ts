import { validateInvoiceForApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-878: [error] 請求書承認検証機能 - 請求明細の数量が負数のとき検証が不合格になる
  test('should reject invoice approval validation when invoice line item has negative quantity', () => {
    const invoice_id = 'INV-20240115-001';
    const customer_id = 'CUST-12345';
    const total_amount = 100000;
    const invoice_date = '2024-01-15T09:00:00Z';
    const due_date = '2024-02-15T23:59:59Z';
    const line_items = [
      {
        line_item_id: 'LINE-001',
        product_code: 'PROD-A001',
        quantity: -5,
        unit_price: 10000,
        tax_rate: 0.1,
        line_total: -55000,
      },
    ];

    const invoice_data = {
      invoice_id,
      customer_id,
      total_amount,
      invoice_date,
      due_date,
      line_items,
    };

    const validation_result = validateInvoiceForApproval(invoice_data);

    expect(validation_result.is_valid).toBe(false);
    expect(validation_result.error_message).toMatch(/数量/);
  });
});