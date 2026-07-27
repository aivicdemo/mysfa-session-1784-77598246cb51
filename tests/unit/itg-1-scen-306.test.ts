import { linkDealToInvoice } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-306
  test('商談レコードに請求先顧客IDが不在のとき、紐付けが失敗する', () => {
    const deal = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      billingCustomerId: null,
      amount: 100000,
      status: '受注',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    const invoice = {
      invoiceId: 'INV-001',
      customerId: 'CUST-001',
      amount: 100000,
      issuedAt: new Date('2024-01-15T11:00:00Z'),
    };

    expect(() => linkDealToInvoice(deal, invoice)).toThrow(/請求先顧客ID/);
  });
});