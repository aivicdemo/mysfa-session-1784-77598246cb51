import { fetchCustomerPurchaseHistory } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  // SCEN-373
  test('[normal] 設定対象期間内に購買履歴が複数件の場合、全件が返される', () => {
    const customerId = 'CUST-001';
    const targetStartDate = new Date('2024-01-01T00:00:00Z');
    const targetEndDate = new Date('2024-03-31T23:59:59Z');

    const purchaseHistories = [
      {
        purchaseId: 'PUR-001',
        customerId: customerId,
        purchaseDate: new Date('2024-01-15T00:00:00Z'),
        amount: 100000,
        productName: '商品A'
      },
      {
        purchaseId: 'PUR-002',
        customerId: customerId,
        purchaseDate: new Date('2024-02-20T00:00:00Z'),
        amount: 150000,
        productName: '商品B'
      },
      {
        purchaseId: 'PUR-003',
        customerId: customerId,
        purchaseDate: new Date('2024-03-10T00:00:00Z'),
        amount: 75000,
        productName: '商品C'
      },
      {
        purchaseId: 'PUR-004',
        customerId: customerId,
        purchaseDate: new Date('2023-12-01T00:00:00Z'),
        amount: 50000,
        productName: '商品D'
      }
    ];

    const result = fetchCustomerPurchaseHistory(
      customerId,
      targetStartDate,
      targetEndDate,
      purchaseHistories
    );

    expect(result).toEqual([
      {
        purchaseId: 'PUR-001',
        customerId: customerId,
        purchaseDate: new Date('2024-01-15T00:00:00Z'),
        amount: 100000,
        productName: '商品A'
      },
      {
        purchaseId: 'PUR-002',
        customerId: customerId,
        purchaseDate: new Date('2024-02-20T00:00:00Z'),
        amount: 150000,
        productName: '商品B'
      },
      {
        purchaseId: 'PUR-003',
        customerId: customerId,
        purchaseDate: new Date('2024-03-10T00:00:00Z'),
        amount: 75000,
        productName: '商品C'
      }
    ]);

    expect(result).toHaveLength(3);
    expect(result.every(h => h.customerId === customerId)).toBe(true);
    expect(
      result.every(
        h =>
          h.purchaseDate >= targetStartDate &&
          h.purchaseDate <= targetEndDate
      )
    ).toBe(true);
  });
});