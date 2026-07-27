import { fetchLicenseUsers } from '../../src/logic/it-1-3';

describe('Salesforce Metadata API / Tooling API連携 - ライセンスユーザー取得', () => {
  test('SCEN-1017: fetchLicenseUsersが成功応答を受けた場合、Organization内の全ユーザー一覧とライセンスエディション情報が取得される', async () => {
    // Arrange: モック化されたSalesforceMetadataDataSourceの成功応答を定義
    const mockSalesforceDataSource = {
      fetchLicenseUsers: jest.fn().mockResolvedValue([
        {
          userId: 'user_001',
          userName: 'Taro Yamada',
          emailAddress: 'taro.yamada@example.com',
          licenseEdition: 'Salesforce',
          licenseAssignedAt: new Date('2024-01-15T09:00:00Z'),
        },
        {
          userId: 'user_002',
          userName: 'Hanako Suzuki',
          emailAddress: 'hanako.suzuki@example.com',
          licenseEdition: 'Lightning',
          licenseAssignedAt: new Date('2024-02-01T10:30:00Z'),
        },
        {
          userId: 'user_003',
          userName: 'Jiro Tanaka',
          emailAddress: 'jiro.tanaka@example.com',
          licenseEdition: 'Platform',
          licenseAssignedAt: new Date('2024-03-10T14:15:00Z'),
        },
      ]),
    };

    // Act: fetchLicenseUsers処理を実行
    const result = await fetchLicenseUsers(mockSalesforceDataSource);

    // Assert: 戻り値のユーザー一覧データが正常に受け取られたことを確認
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(3);

    // 各ユーザーオブジェクトがユーザーID、ユーザー名、メールアドレス、ライセンスエディション情報を正確に保持していることを検証
    expect(result[0]).toEqual({
      userId: 'user_001',
      userName: 'Taro Yamada',
      emailAddress: 'taro.yamada@example.com',
      licenseEdition: 'Salesforce',
      licenseAssignedAt: new Date('2024-01-15T09:00:00Z'),
    });

    expect(result[1]).toEqual({
      userId: 'user_002',
      userName: 'Hanako Suzuki',
      emailAddress: 'hanako.suzuki@example.com',
      licenseEdition: 'Lightning',
      licenseAssignedAt: new Date('2024-02-01T10:30:00Z'),
    });

    expect(result[2]).toEqual({
      userId: 'user_003',
      userName: 'Jiro Tanaka',
      emailAddress: 'jiro.tanaka@example.com',
      licenseEdition: 'Platform',
      licenseAssignedAt: new Date('2024-03-10T14:15:00Z'),
    });

    // ライセンスエディション情報がモック応答で指定されたエディション種別と完全に一致することを確認
    expect(result[0].licenseEdition).toBe('Salesforce');
    expect(result[1].licenseEdition).toBe('Lightning');
    expect(result[2].licenseEdition).toBe('Platform');

    // ユーザー数がモック応答で返された総ユーザー数と一致することを検証
    expect(result.length).toBe(3);

    // モック関数が正確に呼び出されたことを検証
    expect(mockSalesforceDataSource.fetchLicenseUsers).toHaveBeenCalledTimes(1);
  });
});