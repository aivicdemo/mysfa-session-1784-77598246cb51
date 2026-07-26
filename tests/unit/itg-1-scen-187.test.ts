import { detectDealStatusAndInvoiceMismatch } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-187: [error] 売上計上予定日と実際の請求日のズレが3日以上ある場合にズレ検出される
  test('売上計上予定日と実際の請求日のズレが3日以上の場合、ズレ検出アラートが表示されること', () => {
    const deal = {
      deal_id: 'DEAL-001',
      deal_status: '受注確定',
      customer_id: 'CUST-001',
      customer_name: 'テスト顧客',
      deal_amount: 1000000,
      scheduled_revenue_date: new Date('2024-01-15T00:00:00Z'),
      invoice_issued_date: new Date('2024-01-18T00:00:00Z'),
      invoice_status: '発行済',
      invoice_amount: 1000000,
    };

    const result = detectDealStatusAndInvoiceMismatch([deal]);

    expect(result).toEqual({
      mismatch_detected: true,
      mismatch_count: 1,
      mismatch_details: [
        {
          deal_id: 'DEAL-001',
          customer_id: 'CUST-001',
          customer_name: 'テスト顧客',
          deal_status: '受注確定',
          scheduled_revenue_date: '2024-01-15',
          invoice_issued_date: '2024-01-18',
          mismatch_days: 3,
          mismatch_type: 'ズレあり',
          alert_message: '売上計上予定日と実際の請求日のズレが3日以上です',
        },
      ],
    });
    expect(result.mismatch_detected).toBe(true);
    expect(result.mismatch_count).toBe(1);
    expect(result.mismatch_details[0].mismatch_days).toBe(3);
    expect(result.mismatch_details[0].mismatch_type).toBe('ズレあり');
  });
});