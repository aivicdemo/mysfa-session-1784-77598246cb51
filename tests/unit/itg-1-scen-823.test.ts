import { validateInvoiceDataValidity } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-823
  test('複数の請求データが存在するとき、合計額が商談金額と一致する場合は承認対象と判定される', () => {
    const deal_id = 'DEAL-001';
    const deal_amount = 300000;
    const invoice_data_list = [
      {
        invoice_id: 'INV-001',
        deal_id: deal_id,
        invoice_amount: 100000,
      },
      {
        invoice_id: 'INV-002',
        deal_id: deal_id,
        invoice_amount: 150000,
      },
      {
        invoice_id: 'INV-003',
        deal_id: deal_id,
        invoice_amount: 50000,
      },
    ];

    const result = validateInvoiceDataValidity({
      deal_id: deal_id,
      deal_amount: deal_amount,
      invoice_data_list: invoice_data_list,
    });

    expect(result.status).toBe('承認対象');
    expect(result.reason).toContain('複数請求データの合計額');
    expect(result.reason).toContain('300000');
    expect(result.reason).toContain('一致');
    expect(result.total_invoice_amount).toBe(300000);
  });
});