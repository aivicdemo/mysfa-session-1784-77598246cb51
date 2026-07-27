import { logDataAccess } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-203: [edge] AWS CloudTrail / CloudWatch Logs連携 - logDataAccessの応答形式が想定と異なる場合、誤ったデータアクセス操作が監査ログとして記録されない
  test('応答形式が想定と異なる場合、内部アクセスログテーブルに記録され、再試行キューに保持される', async () => {
    // 期待される正常なスキーマ
    const expectedSchema = {
      event_id: 'string',
      timestamp: 'string',
      user_id: 'string',
      operation_type: 'string',
      resource_id: 'string',
    };

    // 異なる応答形式を返すスタブ（フィールド名不一致、データ型不一致、必須フィールド欠落）
    const malformedResponse = {
      evt_id: '12345',
      ts: 1705318800000,
      uid: 'user123',
      // operation_type フィールド欠落
      // resource_id フィールド欠落
      extra_field: 'unexpected_value',
    };

    const auditLogExporterStub = {
      logDataAccess: jest.fn().mockResolvedValue(malformedResponse),
      logUserAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    const internalAccessLogRecord = {
      id: 'log_entry_001',
      user_id: 'customer_user_456',
      portal_access_datetime: new Date('2024-01-15T10:30:00Z'),
      data_access_type: 'view_deal_details',
      deal_id: 'deal_789',
      status: 'recorded_locally',
    };

    const retryQueueEntry = {
      queue_id: 'queue_retry_001',
      audit_event_data: malformedResponse,
      failure_reason: 'schema_validation_failed',
      retry_count: 0,
      max_retries: 5,
      next_retry_datetime: new Date('2024-01-15T10:30:01Z'),
      backoff_intervals_ms: [1000, 2000, 4000, 8000, 16000],
    };

    const adminAlertMessage = {
      alert_id: 'alert_audit_001',
      severity: 'error',
      message: 'ログ送信エラー',
      affected_event_count: 1,
      created_datetime: new Date('2024-01-15T10:30:00Z'),
    };

    // 実行：顧客が商談情報の参照操作を実行
    const result = await logDataAccess(
      {
        user_id: 'customer_user_456',
        operation_type: 'view_deal_details',
        resource_id: 'deal_789',
        timestamp: new Date('2024-01-15T10:30:00Z'),
      },
      auditLogExporterStub,
    );

    // 検証：応答形式が想定と異なることを確認
    expect(result.schema_validation_status).toBe('failed');
    expect(result.validation_error_detail).toMatch(/schema_validation_failed|required_fields|field_mismatch/i);

    // 検証：内部アクセスログテーブルにイベントが記録される
    expect(result.internal_log_recorded).toBe(true);
    expect(result.internal_log_entry).toEqual(
      expect.objectContaining({
        user_id: 'customer_user_456',
        data_access_type: 'view_deal_details',
        deal_id: 'deal_789',
        status: 'recorded_locally',
      }),
    );

    // 検証：AuditLogExporterの再試行キューに失敗ログが保持される
    expect(result.retry_queue_preserved).toBe(true);
    expect(result.retry_queue_entry).toEqual(
      expect.objectContaining({
        failure_reason: expect.stringMatching(/schema_validation_failed|format_error/),
        retry_count: 0,
        max_retries: 5,
      }),
    );
    expect(result.retry_queue_entry.backoff_intervals_ms).toEqual(
      expect.arrayContaining([1000, 2000, 4000, 8000, 16000]),
    );

    // 検証：管理者向けダッシュボードに「ログ送信エラー」アラートが表示される
    expect(result.admin_alert_triggered).toBe(true);
    expect(result.admin_alert_message).toMatch(/ログ送信エラー/);
    expect(result.alert_severity).toBe('error');

    // 検証：ユーザーのポータル操作自体は継続可能な状態が維持される
    expect(result.user_portal_operation_blocked).toBe(false);
    expect(result.operation_can_continue).toBe(true);
  });
});