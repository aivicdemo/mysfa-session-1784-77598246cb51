import { searchCustomerRecords } from '../../src/logic/it-1';

describe('顧客レコード検索機能', () => {
  test('SCEN-180: 検索条件に合致する顧客レコードが存在しない場合、空の結果セットが返される', async () => {
    // Arrange
    const searchQuery = 'ZZZ999999';
    const mockEmptyResponse = {
      records: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 50,
      hasNextPage: false,
      message: '検索結果がありません'
    };

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockEmptyResponse)
      } as Response)
    );

    // Act
    const result = await searchCustomerRecords(searchQuery);

    // Assert
    expect(result).toEqual({
      records: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 50,
      hasNextPage: false,
      message: '検索結果がありません'
    });
    expect(result.records).toHaveLength(0);
    expect(result.totalCount).toBe(0);
    expect(result.message).toBe('検索結果がありません');

    // Verify API was called with correct search query
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(searchQuery),
      expect.any(Object)
    );
  });
});