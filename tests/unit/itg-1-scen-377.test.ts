import { filterPurchaseHistoryByPeriod } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  // SCEN-377
  test('対象期間の終了日より後の購買履歴は除外される', () => {
    const purchaseHistory = [
      {
        purchaseDate: new Date('2024-01-15T00:00:00Z'),
        amount: 50000,
        productName: 'Product A',
      },
      {
        purchaseDate: new Date('2024-02-20T00:00:00Z'),
        amount: 75000,
        productName: 'Product B',
      },
      {
        purchaseDate: new Date('2024-03-25T00:00:00Z'),
        amount: 60000,
        productName: 'Product C',
      },
      {
        purchaseDate: new Date('2024-04-10T00:00:00Z'),
        amount: 80000,
        productName: 'Product D',
      },
      {
        purchaseDate: new Date('2024-05-05T00:00:00Z'),
        amount: 45000,
        productName: 'Product E',
      },
    ];

    const periodStartDate = new Date('2024-02-01T00:00:00Z');
    const periodEndDate = new Date('2024-04-30T00:00:00Z');

    const filteredHistory = filterPurchaseHistoryByPeriod(
      purchaseHistory,
      periodStartDate,
      periodEndDate
    );

    expect(filteredHistory).toEqual([
      {
        purchaseDate: new Date('2024-02-20T00:00:00Z'),
        amount: 75000,
        productName: 'Product B',
      },
      {
        purchaseDate: new Date('2024-03-25T00:00:00Z'),
        amount: 60000,
        productName: 'Product C',
      },
      {
        purchaseDate: new Date('2024-04-10T00:00:00Z'),
        amount: 80000,
        productName: 'Product D',
      },
    ]);
    expect(filteredHistory).toHaveLength(3);
  });
});