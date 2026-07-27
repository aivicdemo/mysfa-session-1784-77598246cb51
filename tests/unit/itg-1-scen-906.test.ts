import { validateInvoiceForApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 請求書承認検証', () => {
  test('SCEN-906: 請求書に紐付く見積レコードが存在しないとき検証が不合格になる', () => {
    const invoice_record = {
      invoice_id: 'INV-TEST-906',
      customer_id: 'CUST-001',
      amount: 10000,
      status: '未承認',
      quote_id: null,
    };

    const validation_result = validateInvoiceForApproval(invoice_record);

    expect(validation_result.is_valid).toBe(false);
    expect(validation_result.validation_status).toBe('失敗');
    expect(validation_result.error_code).toBe('QUOTE_NOT_FOUND');
    expect(validation_result.error_message).toMatch(/見積レコードが紐付いていません/);
    expect(validation_result.detail_invoice_id).toBe('INV-TEST-906');
  });
});