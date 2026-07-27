import { fetchPurchaseHistoryByDateRange } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  test('SCEN-383: 対象期間の開始日と終了日が同日の場合、その日の購買履歴のみが返される', () => {
    // Arrange
    const customerId = 'CUST-001';
    const targetDate = new Date('2024-01-15T00:00:00Z');
    const startDate = new Date('2024-01-15T00:00:00Z');
    const endDate = new Date('2024-01-15T23:59:59Z');

    const mockPurchaseHistories = [
      {
        id: 'PH-001',
        customerId: customerId,
        purchaseDate: new Date('2024-01-15T10:30:00Z'),
        amount: 50000,
        productName: '商品A',
      },
      {
        id: 'PH-002',
        customerId: customerId,
        purchaseDate: new Date('2024-01-15T14:15:00Z'),
        amount: 30000,
        productName: '商品B',
      },
      {
        id: 'PH-003',
        customerId: customerId,
        purchaseDate: new Date('2024-01-14T09:00:00Z'),
        amount: 25000,
        productName: '商品C',
      },
      {
        id: 'PH-004',
        customerId: customerId,
        purchaseDate: new Date('2024-01-16T11:00:00Z'),
        amount: 15000,
        productName: '商品D',
      },
    ];

    // Act
    const result = fetchPurchaseHistoryByDateRange(customerId, startDate, endDate, mockPurchaseHistories);

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('PH-001');
    expect(result[0].purchaseDate).toEqual(new Date('2024-01-15T10:30:00Z'));
    expect(result[0].amount).toBe(50000);
    expect(result[1].id).toBe('PH-002');
    expect(result[1].purchaseDate).toEqual(new Date('2024-01-15T14:15:00Z'));
    expect(result[1].amount).toBe(30000);
    expect(result.every(record => record.customerId === customerId)).toBe(true);
    expect(result.every(record => {
      const recordDate = new Date(record.purchaseDate);
      return recordDate >= startDate && recordDate <= endDate;
    })).toBe(true);
  });
});