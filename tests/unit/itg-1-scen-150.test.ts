import { aggregateMonthlySalesAmount } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-150
  test('当月商談金額集計機能 - 明細行の金額がnullのとき例外が発生する', () => {
    const dealWithNullAmount = {
      dealId: 'DEAL-001',
      customerId: 'CUST-001',
      dealDate: '2024-01-15',
      lineItems: [
        {
          lineItemId: 'LINE-001',
          productId: 'PROD-001',
          quantity: 2,
          unitPrice: 50000,
          amount: 100000,
        },
        {
          lineItemId: 'LINE-002',
          productId: 'PROD-002',
          quantity: 1,
          unitPrice: 30000,
          amount: null,
        },
      ],
    };

    expect(() => aggregateMonthlySalesAmount([dealWithNullAmount])).toThrow(/金額/);
  });

  test('当月商談金額集計機能 - 明細行の金額がundefinedのとき例外が発生する', () => {
    const dealWithUndefinedAmount = {
      dealId: 'DEAL-002',
      customerId: 'CUST-002',
      dealDate: '2024-01-20',
      lineItems: [
        {
          lineItemId: 'LINE-003',
          productId: 'PROD-003',
          quantity: 3,
          unitPrice: 25000,
          amount: 75000,
        },
        {
          lineItemId: 'LINE-004',
          productId: 'PROD-004',
          quantity: 2,
          unitPrice: 40000,
          amount: undefined,
        },
      ],
    };

    expect(() => aggregateMonthlySalesAmount([dealWithUndefinedAmount])).toThrow(/金額/);
  });
});