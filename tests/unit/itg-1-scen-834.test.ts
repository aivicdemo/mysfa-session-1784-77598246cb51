import { validateInvoiceLineItem } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-834
  test('請求明細の数量が負数のとき、該当データを不承認と判定する', () => {
    const invoiceLineItem = {
      product_id: 'P001',
      quantity: -5,
      unit_price: 1000,
      invoice_target_flag: true,
    };

    const result = validateInvoiceLineItem(invoiceLineItem);

    expect(result.approval_status).toBe('unapproved');
    expect(result.error_reasons).toContain('数量が負数です');
    expect(result.is_unapproved_flagged).toBe(true);
  });
});