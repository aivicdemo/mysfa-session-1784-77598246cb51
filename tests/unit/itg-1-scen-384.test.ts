import { fetchPurchaseHistory } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  // SCEN-384
  test('購買履歴が時系列昇順で返される', () => {
    const customerId = 'CUST-001';
    
    const mockPurchaseHistory = [
      {
        purchaseId: 'PUR-001',
        customerId: customerId,
        productName: '商品A',
        amount: 10000,
        purchaseDate: '2024-01-15',
      },
      {
        purchaseId: 'PUR-003',
        customerId: customerId,
        productName: '商品C',
        amount: 15000,
        purchaseDate: '2024-02-10',
      },
      {
        purchaseId: 'PUR-002',
        customerId: customerId,
        productName: '商品B',
        amount: 25000,
        purchaseDate: '2024-03-20',
      },
    ];

    const result = fetchPurchaseHistory(customerId, mockPurchaseHistory);

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      purchaseId: 'PUR-001',
      customerId: customerId,
      productName: '商品A',
      amount: 10000,
      purchaseDate: '2024-01-15',
    });
    expect(result[1]).toEqual({
      purchaseId: 'PUR-003',
      customerId: customerId,
      productName: '商品C',
      amount: 15000,
      purchaseDate: '2024-02-10',
    });
    expect(result[2]).toEqual({
      purchaseId: 'PUR-002',
      customerId: customerId,
      productName: '商品B',
      amount: 25000,
      purchaseDate: '2024-03-20',
    });
  });
});