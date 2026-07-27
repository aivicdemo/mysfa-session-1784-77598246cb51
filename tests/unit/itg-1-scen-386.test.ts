import { fetchPurchaseHistory } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  // SCEN-386
  test('購買履歴データセットが重複を含む場合、全ての重複データが返される', async () => {
    const customerId = 'CUST-12345';
    const lookbackYears = 3;

    const duplicateHistoryDataset = [
      {
        productId: 'PROD-001',
        purchaseDate: '2024-01-15',
        amount: 50000,
        currency: 'JPY',
        recordId: 'HIST-001',
      },
      {
        productId: 'PROD-001',
        purchaseDate: '2024-01-15',
        amount: 50000,
        currency: 'JPY',
        recordId: 'HIST-002',
      },
      {
        productId: 'PROD-001',
        purchaseDate: '2024-01-15',
        amount: 50000,
        currency: 'JPY',
        recordId: 'HIST-003',
      },
      {
        productId: 'PROD-002',
        purchaseDate: '2024-02-20',
        amount: 30000,
        currency: 'JPY',
        recordId: 'HIST-004',
      },
      {
        productId: 'PROD-002',
        purchaseDate: '2024-02-20',
        amount: 30000,
        currency: 'JPY',
        recordId: 'HIST-005',
      },
    ];

    const result = await fetchPurchaseHistory(
      customerId,
      lookbackYears,
      duplicateHistoryDataset
    );

    expect(result).toHaveLength(5);
    expect(result[0]).toEqual({
      productId: 'PROD-001',
      purchaseDate: '2024-01-15',
      amount: 50000,
      currency: 'JPY',
      recordId: 'HIST-001',
    });
    expect(result[1]).toEqual({
      productId: 'PROD-001',
      purchaseDate: '2024-01-15',
      amount: 50000,
      currency: 'JPY',
      recordId: 'HIST-002',
    });
    expect(result[2]).toEqual({
      productId: 'PROD-001',
      purchaseDate: '2024-01-15',
      amount: 50000,
      currency: 'JPY',
      recordId: 'HIST-003',
    });
    expect(result[3]).toEqual({
      productId: 'PROD-002',
      purchaseDate: '2024-02-20',
      amount: 30000,
      currency: 'JPY',
      recordId: 'HIST-004',
    });
    expect(result[4]).toEqual({
      productId: 'PROD-002',
      purchaseDate: '2024-02-20',
      amount: 30000,
      currency: 'JPY',
      recordId: 'HIST-005',
    });
  });
});