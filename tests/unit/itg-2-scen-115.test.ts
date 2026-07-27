import { validateInvoiceForApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 請求書承認検証機能', () => {
  // SCEN-115
  test('[error] 請求書承認検証機能 - 請求書の顧客情報が商談の顧客情報と一致しないとき、検証エラーが発生する', () => {
    const deal_data = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-A',
      customer_name: '株式会社テスト',
    };

    const invoice_data = {
      invoice_id: 'INV-001',
      customer_id: 'CUST-B',
      customer_name: '異なる顧客企業',
    };

    expect(() =>
      validateInvoiceForApproval(deal_data, invoice_data)
    ).toThrow(/顧客情報/);
  });
});