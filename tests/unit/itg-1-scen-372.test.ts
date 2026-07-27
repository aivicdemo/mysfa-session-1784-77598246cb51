import { fetchPastPurchaseHistory } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  test('SCEN-372: 設定対象期間内に購買履歴が1件の場合、その1件のみが返される', () => {
    const customerId = 'CUST-001';
    const searchStartDate = new Date('2024-01-01T00:00:00Z');
    const searchEndDate = new Date('2024-01-31T23:59:59Z');

    const purchaseHistoryData = [
      {
        customerId: 'CUST-001',
        productCode: 'PRD-100',
        amount: 50000,
        purchaseDate: new Date('2024-01-15T10:30:00Z'),
      },
      {
        customerId: 'CUST-001',
        productCode: 'PRD-200',
        amount: 75000,
        purchaseDate: new Date('2023-12-20T14:15:00Z'),
      },
      {
        customerId: 'CUST-001',
        productCode: 'PRD-300',
        amount: 30000,
        purchaseDate: new Date('2024-02-05T09:00:00Z'),
      },
    ];

    const result = fetchPastPurchaseHistory(
      customerId,
      purchaseHistoryData,
      searchStartDate,
      searchEndDate
    );

    expect(result).toEqual([
      {
        customerId: 'CUST-001',
        productCode: 'PRD-100',
        amount: 50000,
        purchaseDate: new Date('2024-01-15T10:30:00Z'),
      },
    ]);
    expect(result.length).toBe(1);
  });
});