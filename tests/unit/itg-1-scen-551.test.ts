import { detectUnbilledAndDelayedCases } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-551
  test('ステータスが『受注』であっても請求書発行状況フィールドが空文字列のとき『未請求案件』として特定される', () => {
    const dealRecords = [
      {
        deal_id: 'DEAL-001',
        customer_id: 'CUST-123',
        status: '受注',
        amount: 500000,
        invoice_issued_status: '',
        invoice_issued_date: null,
        expected_billing_date: new Date('2024-04-15').toISOString(),
      },
    ];

    const result = detectUnbilledAndDelayedCases(dealRecords);

    expect(result).toEqual({
      unbilled_cases: [
        {
          deal_id: 'DEAL-001',
          customer_id: 'CUST-123',
          classification: '未請求案件',
          status: '受注',
          amount: 500000,
          invoice_issued_status: '',
          invoice_issued_date: null,
          expected_billing_date: new Date('2024-04-15').toISOString(),
        },
      ],
      delayed_cases: [],
      total_unbilled_amount: 500000,
      total_delayed_amount: 0,
    });

    expect(result.unbilled_cases).toHaveLength(1);
    expect(result.unbilled_cases[0].classification).toBe('未請求案件');
    expect(result.unbilled_cases[0].deal_id).toBe('DEAL-001');
  });
});