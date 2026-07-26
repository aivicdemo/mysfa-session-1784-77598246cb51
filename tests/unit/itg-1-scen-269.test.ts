import { grantPortalAccessIfNotExists } from '../../src/logic/it-1784969823049-2-1-1';

describe('顧客ポータルアクセス権限自動付与機能', () => {
  // SCEN-269: [edge] 顧客ポータルアクセス権限自動付与機能 - 既に権限が付与されている顧客担当者に対して重複付与が発生しない
  test('既に権限が付与されている顧客担当者に対して重複付与が発生しないこと', () => {
    // 初期状態: 権限レコードが空
    const initial_permissions: Array<{
      employee_id: string;
      portal_access_granted: boolean;
      granted_at: string;
    }> = [];

    // テスト用顧客担当者A（ID: EMP-001）を作成
    const employee_a = {
      employee_id: 'EMP-001',
      employee_name: '営業担当者A',
      customer_id: 'CUST-12345',
    };

    // 権限付与後のレコード確認: 顧客担当者Aの権限が1件存在することを検証
    const first_grant_result = grantPortalAccessIfNotExists(employee_a.employee_id, {
      employee_id: employee_a.employee_id,
      customer_id: employee_a.customer_id,
    });

    expect(first_grant_result.granted).toBe(true);
    expect(first_grant_result.permission_count).toBe(1);
    expect(first_grant_result.log_message).toBe('ポータルアクセス権限を付与しました');

    // 同じ顧客担当者Aに対して重複して権限自動付与処理を実行
    const second_grant_result = grantPortalAccessIfNotExists(employee_a.employee_id, {
      employee_id: employee_a.employee_id,
      customer_id: employee_a.customer_id,
    });

    // 権限付与処理完了後、顧客担当者Aの権限レコード件数を再確認
    // 顧客担当者Aの権限レコードは1件のままで重複が発生せず
    expect(second_grant_result.permission_count).toBe(1);
    expect(second_grant_result.granted).toBe(false);

    // 権限付与履歴ログには2回目の処理で『既存権限を検出、付与スキップ』という内容が記録されていること
    expect(second_grant_result.log_message).toBe('既存権限を検出、付与スキップ');
    expect(second_grant_result.is_duplicate_attempt).toBe(true);
  });
});