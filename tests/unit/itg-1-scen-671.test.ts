import { validateDealStatusForInvoiceLinking } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-671
  test('商談ステータスが空のとき、バリデーションエラーが発生する', () => {
    const dealRecord = {
      dealId: 'DEAL-001',
      customerName: 'テスト顧客A',
      amount: 100000,
      dealStatus: null,
    };

    expect(() => validateDealStatusForInvoiceLinking(dealRecord)).toThrow(/ステータス/);
  });
});