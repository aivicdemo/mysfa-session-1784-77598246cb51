import { validateInvoiceAccess } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-103
  test('顧客が権限がない請求書にアクセスしようとした場合、検証機能へのアクセスが拒否される', () => {
    const customer_user_id = 'customer_user_001';
    const unauthorized_invoice_id = 'invoice_999';
    const user_accessible_invoices = ['invoice_001', 'invoice_002'];

    const access_result = validateInvoiceAccess({
      customer_user_id,
      invoice_id: unauthorized_invoice_id,
      user_accessible_invoices,
    });

    expect(access_result).toEqual({
      status_code: 403,
      error_message: 'アクセス権限がありません',
      is_allowed: false,
    });
  });
});