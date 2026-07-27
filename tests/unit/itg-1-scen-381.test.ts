import { getCustomerPurchaseHistory } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  // SCEN-381
  test('顧客IDがNullの場合、ValidationErrorがスローされる', () => {
    expect(() => {
      getCustomerPurchaseHistory({
        customerId: null as any,
      });
    }).toThrow(/顧客ID/);
  });
});