import { detectUnbilledAndDelayedDeals } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-265
  test('受注ステータスでも請求予定日が設定されていない場合に検出エラーを返す', () => {
    const deal = {
      dealId: 'DEAL-001',
      status: '受注',
      amount: 500000,
      customerId: 'CUST-123',
      invoicePlannedDate: null,
      invoiceIssuedDate: null,
    };

    expect(() => {
      detectUnbilledAndDelayedDeals([deal]);
    }).toThrow(/請求予定日/);
  });
});