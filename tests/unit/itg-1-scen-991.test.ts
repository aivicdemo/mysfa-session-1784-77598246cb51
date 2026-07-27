import { validateUserPermissionMigration } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-991: [error] 移行完了判定機能 - 移行前後でユーザー権限マッピングが1件でも不正な場合、権限不整合として検出される
  test('旧システムと新システムのユーザー権限マッピングに不整合がある場合、権限不整合エラーを返す', () => {
    const legacy_user_permissions = [
      { user_id: 'USR001', legacy_role: 'SALES_REP', expected_new_role: 'SALES_USER' },
      { user_id: 'USR002', legacy_role: 'MANAGER', expected_new_role: 'SALES_MANAGER' },
      { user_id: 'USR003', legacy_role: 'SALES_REP', expected_new_role: 'SALES_USER' },
      { user_id: 'USR004', legacy_role: 'ADMIN', expected_new_role: 'SYSTEM_ADMIN' },
      { user_id: 'USR005', legacy_role: 'VIEWER', expected_new_role: 'GUEST' },
    ];

    const migrated_user_permissions = [
      { user_id: 'USR001', new_role: 'SALES_USER' },
      { user_id: 'USR002', new_role: 'SALES_MANAGER' },
      { user_id: 'USR003', new_role: 'SALES_USER' },
      { user_id: 'USR004', new_role: 'SYSTEM_ADMIN' },
      { user_id: 'USR005', new_role: 'GUEST' },
    ];

    // 意図的に USR002 の権限を誤った値に設定（マネージャー → ゲストに変更）
    const migrated_user_permissions_with_mismatch = [
      { user_id: 'USR001', new_role: 'SALES_USER' },
      { user_id: 'USR002', new_role: 'GUEST' },
      { user_id: 'USR003', new_role: 'SALES_USER' },
      { user_id: 'USR004', new_role: 'SYSTEM_ADMIN' },
      { user_id: 'USR005', new_role: 'GUEST' },
    ];

    const result = validateUserPermissionMigration(
      legacy_user_permissions,
      migrated_user_permissions_with_mismatch
    );

    expect(result.migration_status).toBe('FAILED');
    expect(result.has_permission_mismatch).toBe(true);
    expect(result.mismatched_users).toHaveLength(1);
    expect(result.mismatched_users[0]).toEqual({
      user_id: 'USR002',
      legacy_role: 'MANAGER',
      expected_new_role: 'SALES_MANAGER',
      actual_new_role: 'GUEST',
    });
    expect(result.error_message).toMatch(/権限不整合/);
  });
});