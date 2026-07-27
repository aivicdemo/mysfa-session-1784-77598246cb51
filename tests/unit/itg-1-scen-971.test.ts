import { reconcileSalesAndInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-971
  test('売上実績・請求状況照合機能 - 売上実績の金額が端数を含む場合、端数を含めて正確に照合される', () => {
    const sales_amount = 1234.56;
    const invoice_amount = 1234.56;

    const sales_record = {
      sales_id: 'SALES-001',
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      amount: sales_amount,
      recorded_date: '2024-01-15T11:00:00Z',
    };

    const invoice_record = {
      invoice_id: 'INV-001',
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      amount: invoice_amount,
      issued_date: '2024-01-15T11:00:00Z',
      status: 'issued',
    };

    const result = reconcileSalesAndInvoice(sales_record, invoice_record);

    expect(result.match_status).toBe('match');
    expect(result.sales_amount).toBe(1234.56);
    expect(result.invoice_amount).toBe(1234.56);
    expect(result.difference_amount).toBe(0.00);
    expect(result.reconciliation_status).toBe('completed');
  });
});