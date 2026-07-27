import { filterPurchaseHistoryByMonthEnd } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  test('SCEN-387: 月末日の購買履歴がフィルタリングされる', () => {
    const testPurchaseRecords = [
      {
        id: 'purchase_001',
        customerId: 'customer_123',
        purchaseDate: new Date('2024-01-31T23:59:59Z'),
        amount: 50000,
      },
      {
        id: 'purchase_002',
        customerId: 'customer_123',
        purchaseDate: new Date('2024-02-01T00:00:00Z'),
        amount: 30000,
      },
      {
        id: 'purchase_003',
        customerId: 'customer_123',
        purchaseDate: new Date('2024-02-29T12:00:00Z'),
        amount: 75000,
      },
      {
        id: 'purchase_004',
        customerId: 'customer_123',
        purchaseDate: new Date('2024-03-01T00:00:00Z'),
        amount: 45000,
      },
    ];

    const filterStartDate = new Date('2024-01-01T00:00:00Z');
    const filterEndDate = new Date('2024-03-31T23:59:59Z');

    const filteredResults = filterPurchaseHistoryByMonthEnd(
      testPurchaseRecords,
      filterStartDate,
      filterEndDate
    );

    expect(filteredResults).toHaveLength(2);
    expect(filteredResults[0]).toEqual({
      id: 'purchase_001',
      customerId: 'customer_123',
      purchaseDate: new Date('2024-01-31T23:59:59Z'),
      amount: 50000,
    });
    expect(filteredResults[1]).toEqual({
      id: 'purchase_003',
      customerId: 'customer_123',
      purchaseDate: new Date('2024-02-29T12:00:00Z'),
      amount: 75000,
    });
  });
});