import { fetchPurchaseHistory } from '../../src/logic/it-1';

describe('顧客レコード過去購買履歴表示機能', () => {
  test('SCEN-371: 設定対象期間内に購買履歴が0件の場合、空のリストが返される', async () => {
    // Arrange
    const customerId = 'TEST-CUST-001';
    const startDate = new Date('2024-01-01T00:00:00Z');
    const endDate = new Date('2024-01-31T23:59:59Z');

    const assumedEmptyResponse = {
      customerId,
      purchaseHistory: [],
      totalCount: 0,
      message: '該当するデータがありません',
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(assumedEmptyResponse),
      } as Response)
    );

    // Act
    const result = await fetchPurchaseHistory(customerId, startDate, endDate);

    // Assert
    expect(result).toEqual({
      customerId: 'TEST-CUST-001',
      purchaseHistory: [],
      totalCount: 0,
      message: '該当するデータがありません',
    });
    expect(result.purchaseHistory).toHaveLength(0);
    expect(result.totalCount).toBe(0);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/customer/TEST-CUST-001/purchase-history'),
      expect.objectContaining({
        method: 'GET',
      })
    );
  });
});