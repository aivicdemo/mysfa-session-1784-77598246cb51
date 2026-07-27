import { detectAmountDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-518
  test('[error] 商談ステータスと請求書発行状況の自動照合・ズレ検出機能 - 商談金額が0円のとき、金額ズレの判定がエラーで終了する', () => {
    const dealId = 'DEAL-00001';
    const dealAmount = 0;
    const dealStatus = '受注';
    const invoiceStatus = '未発行';

    const deal = {
      dealId,
      dealAmount,
      dealStatus,
      invoiceStatus,
      invoiceAmount: 0,
      expectedBillingDate: new Date('2024-01-15'),
      actualInvoiceDate: null,
    };

    expect(() => {
      detectAmountDiscrepancy(deal);
    }).toThrow(/金額/);
  });
});