import { detectDealInvoiceMismatch } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-135
  test('[error] 商談ステータス・請求データ照合・ズレ検出機能 - 商談金額と請求金額が一致しない場合に遅延案件として検出される', () => {
    const deal_id = 'TEST-DEAL-001';
    const deal_amount = 1000000;
    const deal_status = '受注';
    const invoice_id = 'TEST-INV-001';
    const invoice_amount = 950000;
    const invoice_issued_date = new Date('2024-01-15T00:00:00Z');
    const expected_invoice_date = new Date('2024-01-15T00:00:00Z');

    const input = {
      deal_id,
      deal_amount,
      deal_status,
      invoice_id,
      invoice_amount,
      invoice_issued_date,
      expected_invoice_date,
    };

    const result = detectDealInvoiceMismatch(input);

    expect(result).toEqual({
      is_delayed_deal: true,
      amount_difference: 50000,
      difference_ratio: 0.05,
      mismatch_reason: '金額不一致',
      delay_details: {
        deal_id: 'TEST-DEAL-001',
        deal_amount: 1000000,
        invoice_amount: 950000,
        deal_status: '受注',
        invoice_issued_date: new Date('2024-01-15T00:00:00Z'),
      },
    });

    expect(result.is_delayed_deal).toBe(true);
    expect(result.amount_difference).toBe(50000);
    expect(result.difference_ratio).toBe(0.05);
    expect(result.mismatch_reason).toBe('金額不一致');
    expect(result.delay_details.deal_id).toBe('TEST-DEAL-001');
    expect(result.delay_details.amount_difference).toBeUndefined();
  });
});