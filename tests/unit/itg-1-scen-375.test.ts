import { fetchPastPurchaseHistory } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  test('SCEN-375: 対象期間の終了日の購買履歴が含まれる', () => {
    // Arrange: テスト入力データを設定
    const customerId = 'CUST-001';
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-01-31T23:59:59Z');

    // テストデータ: 終了日に作成された購買履歴を含む
    const mockPurchaseHistoryData = [
      {
        purchaseId: 'PUR-001',
        customerId: 'CUST-001',
        productId: 'PROD-001',
        amount: 10000,
        status: '確定',
        createdDate: new Date('2024-01-31T15:30:00Z'),
      },
      {
        purchaseId: 'PUR-002',
        customerId: 'CUST-001',
        productId: 'PROD-002',
        amount: 5000,
        status: '確定',
        createdDate: new Date('2024-01-15T10:00:00Z'),
      },
      {
        purchaseId: 'PUR-003',
        customerId: 'CUST-001',
        productId: 'PROD-003',
        amount: 3000,
        status: '確定',
        createdDate: new Date('2024-02-05T09:00:00Z'), // 対象期間外
      },
    ];

    // Act: 過去購買履歴を取得
    const result = fetchPastPurchaseHistory(
      customerId,
      startDate,
      endDate,
      mockPurchaseHistoryData
    );

    // Assert: 終了日のレコードが含まれることを確認
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      purchaseId: 'PUR-001',
      customerId: 'CUST-001',
      productId: 'PROD-001',
      amount: 10000,
      status: '確定',
      createdDate: new Date('2024-01-31T15:30:00Z'),
    });
    expect(result).toContainEqual({
      purchaseId: 'PUR-002',
      customerId: 'CUST-001',
      productId: 'PROD-002',
      amount: 5000,
      status: '確定',
      createdDate: new Date('2024-01-15T10:00:00Z'),
    });
    // 対象期間外のレコードが除外されることを確認
    expect(result).not.toContainEqual({
      purchaseId: 'PUR-003',
      customerId: 'CUST-001',
      productId: 'PROD-003',
      amount: 3000,
      status: '確定',
      createdDate: new Date('2024-02-05T09:00:00Z'),
    });
  });
});