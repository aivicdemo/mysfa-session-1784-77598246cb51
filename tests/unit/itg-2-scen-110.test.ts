import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-110
  test('[error] 請求書承認検証機能 - 複数の請求書明細の合計が請求書合計金額と一致しないとき、検証エラーが発生する', () => {
    const invoice_line_1 = {
      invoice_line_id: 'IL001',
      amount: 10000,
    };

    const invoice_line_2 = {
      invoice_line_id: 'IL002',
      amount: 20000,
    };

    const invoice_line_3 = {
      invoice_line_id: 'IL003',
      amount: 15000,
    };

    const invoice_detail_lines = [
      invoice_line_1,
      invoice_line_2,
      invoice_line_3,
    ];

    const expected_detail_total = 10000 + 20000 + 15000;

    const invoice = {
      invoice_id: 'INV20240115001',
      customer_id: 'CUST001',
      total_amount: 48000,
      status: 'pending_approval',
      detail_lines: invoice_detail_lines,
    };

    const result = validateInvoiceApproval(invoice);

    expect(result.error_type).toBe('金額検証エラー');
    expect(result.error_message).toBe(
      `明細の合計金額（${expected_detail_total}円）が請求書合計金額（${invoice.total_amount}円）と一致しません`,
    );
    expect(result.validation_status).toBe('NG');
    expect(result.invoice_status).toBe('pending_approval');
  });
});