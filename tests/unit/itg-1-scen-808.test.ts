import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-808
  test('請求明細の合計金額と請求金額が1円未満で異なるとき、該当データを不承認と判定する', () => {
    const invoiceLineItems = [
      {
        line_item_id: 'LINE-001',
        product_name: '商品A',
        unit_price: 1000,
        quantity: 1,
        subtotal: 1000,
      },
      {
        line_item_id: 'LINE-002',
        product_name: '商品B',
        unit_price: 2000,
        quantity: 1,
        subtotal: 2000,
      },
      {
        line_item_id: 'LINE-003',
        product_name: '商品C',
        unit_price: 3000,
        quantity: 1,
        subtotal: 3000,
      },
    ];

    const invoiceData = {
      invoice_id: 'INV-2024-001',
      line_items: invoiceLineItems,
      invoice_amount: 6000.5,
    };

    const result = validateInvoiceData(invoiceData);

    expect(result.approval_status).toBe('REJECTED');
    expect(result.rejection_reason).toMatch(/請求明細の合計金額と請求金額の差分が1円未満/);
    expect(result.line_items_total).toBe(6000);
    expect(result.invoice_amount).toBe(6000.5);
    expect(result.difference).toBe(0.5);
  });
});