import { validatePermissionMappingOnMigration } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-990
  test('移行完了判定機能 - 移行前後でユーザー権限マッピングがすべて正常に変換されている場合、権限一致と判定される', () => {
    const legacyUserPermissions = [
      {
        userId: 'user_a_legacy',
        userName: 'ユーザーA',
        permissionLevel: 'ADMIN',
      },
      {
        userId: 'user_b_legacy',
        userName: 'ユーザーB',
        permissionLevel: 'SALES_REP',
      },
      {
        userId: 'user_c_legacy',
        userName: 'ユーザーC',
        permissionLevel: 'VIEWER',
      },
    ];

    const newSystemUserPermissions = [
      {
        userId: 'user_a_new',
        userName: 'ユーザーA',
        permissionLevel: 'ADMIN',
        legacyUserId: 'user_a_legacy',
      },
      {
        userId: 'user_b_new',
        userName: 'ユーザーB',
        permissionLevel: 'SALES_REP',
        legacyUserId: 'user_b_legacy',
      },
      {
        userId: 'user_c_new',
        userName: 'ユーザーC',
        permissionLevel: 'VIEWER',
        legacyUserId: 'user_c_legacy',
      },
    ];

    const permissionMappingDefinition = {
      ADMIN: 'ADMIN',
      SALES_REP: 'SALES_REP',
      VIEWER: 'VIEWER',
    };

    const mockSalesforceDataSource = {
      fetchLicenseUsers: jest.fn().mockResolvedValue(newSystemUserPermissions),
      fetchEditionDetails: jest.fn(),
      fetchFeatureUsageMetrics: jest.fn(),
      fetchAnnualCostData: jest.fn(),
    };

    const result = validatePermissionMappingOnMigration(
      legacyUserPermissions,
      newSystemUserPermissions,
      permissionMappingDefinition,
      mockSalesforceDataSource
    );

    expect(result.status).toBe('PASSED');
    expect(result.mappingStatus).toBe('ALL_MATCHED');
    expect(result.unmappedUsers).toEqual([]);
    expect(result.mismatchedPermissions).toEqual([]);
    expect(mockSalesforceDataSource.fetchLicenseUsers).toHaveBeenCalled();
  });
});