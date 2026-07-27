import { fetchLicenseUsersWithCache } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  // SCEN-459
  test('キャッシュ有効期限が指定されていない場合、デフォルト値で評価される', async () => {
    const mockDataSource = {
      fetchLicenseUsers: jest.fn().mockResolvedValue({
        users: [
          {
            id: 'user001',
            name: '営業太郎',
            email: 'taro@example.com',
            editionType: 'Enterprise',
          },
          {
            id: 'user002',
            name: '営業花子',
            email: 'hanako@example.com',
            editionType: 'Professional',
          },
        ],
        timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
      }),
    };

    const cacheConfigWithoutTTL = {
      cacheTTL: null,
    };

    const result = await fetchLicenseUsersWithCache(
      mockDataSource,
      cacheConfigWithoutTTL,
    );

    expect(result).toEqual({
      users: [
        {
          id: 'user001',
          name: '営業太郎',
          email: 'taro@example.com',
          editionType: 'Enterprise',
        },
        {
          id: 'user002',
          name: '営業花子',
          email: 'hanako@example.com',
          editionType: 'Professional',
        },
      ],
      timestamp: new Date('2024-01-15T10:00:00Z').getTime(),
      appliedCacheTTL: 3600,
    });

    expect(mockDataSource.fetchLicenseUsers).toHaveBeenCalledTimes(1);
    expect(mockDataSource.fetchLicenseUsers).toHaveBeenCalledWith();
  });
});