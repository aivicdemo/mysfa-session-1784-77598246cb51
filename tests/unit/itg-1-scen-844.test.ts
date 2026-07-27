import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-844
  test('請求書承認検証機能 - 請求書の顧客情報が商談に紐付く顧客と完全一致するとき検証が合格する', () => {
    const deal_id = 'deal-001';
    const customer_id = 'cust-A';
    const customer_name = '株式会社テスト';
    const customer_address = '東京都渋谷区';
    const customer_phone = '03-XXXX-XXXX';
    const customer_email = 'test@example.com';

    const linked_customer = {
      customer_id: customer_id,
      customer_name: customer_name,
      customer_address: customer_address,
      customer_phone: customer_phone,
      customer_email: customer_email,
    };

    const invoice_data = {
      deal_id: deal_id,
      customer_name: customer_name,
      customer_address: customer_address,
      customer_phone: customer_phone,
      customer_email: customer_email,
    };

    const result = validateInvoiceApproval(invoice_data, linked_customer);

    expect(result.is_valid).toBe(true);
    expect(result.validation_status).toBe('検証済み');
    expect(result.reason).toMatch(/顧客情報/);
    expect(result.reason).toMatch(/完全一致/);
  });
});