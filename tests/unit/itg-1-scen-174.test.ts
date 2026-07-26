import { reconcileDealStatusWithInvoiceDate } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-174
  test('請求書発行日が不正な日付形式の場合、照合処理がエラーで終了する', () => {
    const deal_record = {
      deal_id: 'DEAL-001',
      status: '成約',
      customer_id: 'CUST-001',
      amount: 100000,
      expected_invoice_date: '2024-01-15'
    };

    const invoice_record = {
      invoice_id: 'INV-001',
      deal_id: 'DEAL-001',
      issue_date: '2024-13-45',
      amount: 100000
    };

    expect(() =>
      reconcileDealStatusWithInvoiceDate(deal_record, invoice_record)
    ).toThrow(/日付形式/);
  });
});