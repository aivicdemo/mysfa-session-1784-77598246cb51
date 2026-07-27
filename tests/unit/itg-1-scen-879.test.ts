import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-879
  test('請求書の消費税額が正確に計算されている場合、検証が合格する', () => {
    const invoice_data = {
      subtotal_amount: 10000,
      tax_rate: 10,
    };

    const expected_tax_amount = 1000;
    const expected_validation_status = 'pass';

    const validation_result = validateInvoiceApproval(invoice_data);

    expect(validation_result.tax_amount).toBe(expected_tax_amount);
    expect(validation_result.validation_status).toBe(expected_validation_status);
  });
});