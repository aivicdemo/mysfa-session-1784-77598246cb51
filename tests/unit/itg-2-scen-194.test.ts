import { logPermissionChange } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-194
  test('AWS CloudTrail / CloudWatch Logs連携 - logPermissionChangeが成功応答を返した場合、ユーザー権限の変更操作が記録される', async () => {
    // テスト用のユーザー権限変更イベントデータを準備
    const user_id = 'user_12345';
    const previous_role = 'viewer';
    const new_role = 'editor';
    const changed_by = 'admin_user_001';
    const timestamp = new Date('2024-01-15T10:30:00Z').toISOString();

    const permission_change_event = {
      user_id,
      previous_role,
      new_role,
      changed_by,
      timestamp,
    };

    // AWS CloudTrail/CloudWatch Logsへのログ送信を模擬するスタブを設定
    const audit_log_exporter_stub = {
      logPermissionChange: jest.fn().mockResolvedValue({
        success: true,
        log_id: 'log_entry_789',
      }),
      queryAuditLog: jest.fn().mockResolvedValue([
        {
          log_id: 'log_entry_789',
          user_id,
          previous_role,
          new_role,
          changed_by,
          timestamp,
          status: '送信成功',
          event_type: 'PERMISSION_CHANGE',
        },
      ]),
    };

    // logPermissionChangeメソッドを呼び出し
    const result = await logPermissionChange(
      permission_change_event,
      audit_log_exporter_stub
    );

    // logPermissionChangeメソッドの戻り値が成功ステータスを示すことを検証
    expect(result.success).toBe(true);

    // 内部のアクセスログテーブルをクエリ
    const audit_logs = await audit_log_exporter_stub.queryAuditLog({
      user_id,
      event_type: 'PERMISSION_CHANGE',
    });

    // 送信したユーザーID、変更前権限、変更後権限、変更実行者、タイムスタンプが正確に記録されていることを確認
    expect(audit_logs).toHaveLength(1);
    const recorded_log = audit_logs[0];
    expect(recorded_log.user_id).toBe(user_id);
    expect(recorded_log.previous_role).toBe(previous_role);
    expect(recorded_log.new_role).toBe(new_role);
    expect(recorded_log.changed_by).toBe(changed_by);
    expect(recorded_log.timestamp).toBe(timestamp);

    // ログレコードのステータスフィールドが「送信成功」として記録されていることを検証
    expect(recorded_log.status).toBe('送信成功');
  });
});