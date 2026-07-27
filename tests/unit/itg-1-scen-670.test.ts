import { linkDealWithInvoice } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  // SCEN-670
  test('商談IDが空のとき、バリデーションエラーが発生する', () => {
    const invalidInputs = [null, '', undefined];

    invalidInputs.forEach((dealId) => {
      expect(() =>
        linkDealWithInvoice({
          dealId: dealId as any,
        })
      ).toThrow(/商談ID/);
    });
  });
});