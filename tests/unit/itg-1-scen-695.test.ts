import { reconcileQuotationAndInvoiceStatus } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-695
  test('月次決算期限が未設定の場合、照合処理は失敗しMONTHLY_DEADLINE_NOT_SETエラーを返す', () => {
    const dealRecord = {
      dealId: 'DEAL_001',
      dealStatus: '提案',
      invoiceStatus: '未発行',
      monthlyDeadline: null,
      amount: 500000,
      customerName: 'テスト顧客A'
    };

    expect(() => {
      reconcileQuotationAndInvoiceStatus(dealRecord);
    }).toThrow(/MONTHLY_DEADLINE_NOT_SET/);
  });
});