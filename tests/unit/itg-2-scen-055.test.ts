import { describe, test, expect } from '@jest/globals';
import { issueOrder } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-055
  test('帳票発行時に顧客IDが欠けている入力で注文書を発行しようとしたときは例外が発生する', () => {
    const orderInput = {
      customerId: '',
      productName: '商品A',
      quantity: 10,
      unitPrice: 5000,
      totalAmount: 50000,
    };

    expect(() => issueOrder(orderInput)).toThrow(/顧客ID/);
  });
});