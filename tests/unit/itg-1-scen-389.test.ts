import { filterPurchaseHistoryByDateRange } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  // SCEN-389: [edge] 年をまたぐ対象期間で正確にフィルタリングされる
  test('年をまたぐ期間で購買履歴を正確にフィルタリング', () => {
    const customerId = 'TEST-CUST-001';
    const filterStartDate = new Date('2023-11-01T00:00:00Z');
    const filterEndDate = new Date('2024-01-31T23:59:59Z');

    const purchaseHistoryRecords = [
      {
        recordId: 'REC-001',
        customerId: 'TEST-CUST-001',
        productName: '商品A',
        purchaseDate: new Date('2023-11-15T00:00:00Z'),
        amount: 50000,
      },
      {
        recordId: 'REC-002',
        customerId: 'TEST-CUST-001',
        productName: '商品B',
        purchaseDate: new Date('2023-12-20T00:00:00Z'),
        amount: 30000,
      },
      {
        recordId: 'REC-003',
        customerId: 'TEST-CUST-001',
        productName: '商品C',
        purchaseDate: new Date('2024-01-10T00:00:00Z'),
        amount: 75000,
      },
      {
        recordId: 'REC-004',
        customerId: 'TEST-CUST-001',
        productName: '商品D',
        purchaseDate: new Date('2023-10-30T00:00:00Z'),
        amount: 20000,
      },
      {
        recordId: 'REC-005',
        customerId: 'TEST-CUST-001',
        productName: '商品E',
        purchaseDate: new Date('2024-02-05T00:00:00Z'),
        amount: 40000,
      },
    ];

    const result = filterPurchaseHistoryByDateRange(
      customerId,
      purchaseHistoryRecords,
      filterStartDate,
      filterEndDate
    );

    expect(result.filteredRecords).toHaveLength(3);
    expect(result.filteredRecords[0]).toEqual({
      recordId: 'REC-001',
      customerId: 'TEST-CUST-001',
      productName: '商品A',
      purchaseDate: new Date('2023-11-15T00:00:00Z'),
      amount: 50000,
    });
    expect(result.filteredRecords[1]).toEqual({
      recordId: 'REC-002',
      customerId: 'TEST-CUST-001',
      productName: '商品B',
      purchaseDate: new Date('2023-12-20T00:00:00Z'),
      amount: 30000,
    });
    expect(result.filteredRecords[2]).toEqual({
      recordId: 'REC-003',
      customerId: 'TEST-CUST-001',
      productName: '商品C',
      purchaseDate: new Date('2024-01-10T00:00:00Z'),
      amount: 75000,
    });
    expect(result.totalAmount).toBe(155000);
  });
});