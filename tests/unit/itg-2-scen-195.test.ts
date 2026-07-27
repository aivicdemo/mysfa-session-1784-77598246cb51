import { queryAuditLog } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-195
  test('AWS CloudTrail / CloudWatch Logs連携 - queryAuditLogが成功応答を返した場合、期間・ユーザー・操作種別で監査ログが検索される', async () => {
    const start_date_time = new Date('2024-01-01T00:00:00Z');
    const end_date_time = new Date('2024-01-31T23:59:59Z');
    const user_id = 'user_12345';
    const operation_type = 'DATA_ACCESS';

    const assumed_audit_log_records = [
      {
        timestamp: '2024-01-15T10:30:00Z',
        user_id: 'user_12345',
        operation_type: 'DATA_ACCESS',
        target_data_type: 'deal_information',
        action_detail: 'Downloaded deal summary for customer ABC Corp',
        ip_address: '192.168.1.100',
        session_id: 'sess_abc123'
      },
      {
        timestamp: '2024-01-20T14:15:30Z',
        user_id: 'user_12345',
        operation_type: 'DATA_ACCESS',
        target_data_type: 'invoice',
        action_detail: 'Viewed invoice #INV-2024-001',
        ip_address: '192.168.1.100',
        session_id: 'sess_def456'
      },
      {
        timestamp: '2024-01-25T09:45:00Z',
        user_id: 'user_12345',
        operation_type: 'DATA_ACCESS',
        target_data_type: 'quote',
        action_detail: 'Accessed quote details for project XYZ',
        ip_address: '192.168.1.101',
        session_id: 'sess_ghi789'
      }
    ];

    const mock_audit_log_exporter = {
      queryAuditLog: jest.fn().mockResolvedValue(assumed_audit_log_records),
      logUserAccess: jest.fn().mockResolvedValue(undefined),
      logDataAccess: jest.fn().mockResolvedValue(undefined),
      logPermissionChange: jest.fn().mockResolvedValue(undefined)
    };

    const search_result = await queryAuditLog(
      {
        start_date_time,
        end_date_time,
        user_id,
        operation_type
      },
      mock_audit_log_exporter
    );

    expect(search_result).toHaveLength(3);

    expect(search_result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          timestamp: expect.any(String),
          user_id: 'user_12345',
          operation_type: 'DATA_ACCESS',
          target_data_type: expect.any(String),
          action_detail: expect.any(String),
          ip_address: expect.any(String),
          session_id: expect.any(String)
        }),
        expect.objectContaining({
          timestamp: expect.any(String),
          user_id: 'user_12345',
          operation_type: 'DATA_ACCESS',
          target_data_type: expect.any(String),
          action_detail: expect.any(String),
          ip_address: expect.any(String),
          session_id: expect.any(String)
        }),
        expect.objectContaining({
          timestamp: expect.any(String),
          user_id: 'user_12345',
          operation_type: 'DATA_ACCESS',
          target_data_type: expect.any(String),
          action_detail: expect.any(String),
          ip_address: expect.any(String),
          session_id: expect.any(String)
        })
      ])
    );

    expect(search_result[0].user_id).toBe('user_12345');
    expect(search_result[1].user_id).toBe('user_12345');
    expect(search_result[2].user_id).toBe('user_12345');

    expect(search_result[0].operation_type).toBe('DATA_ACCESS');
    expect(search_result[1].operation_type).toBe('DATA_ACCESS');
    expect(search_result[2].operation_type).toBe('DATA_ACCESS');

    expect(new Date(search_result[0].timestamp).getTime()).toBeGreaterThanOrEqual(
      start_date_time.getTime()
    );
    expect(new Date(search_result[0].timestamp).getTime()).toBeLessThanOrEqual(
      end_date_time.getTime()
    );

    expect(new Date(search_result[1].timestamp).getTime()).toBeGreaterThanOrEqual(
      start_date_time.getTime()
    );
    expect(new Date(search_result[1].timestamp).getTime()).toBeLessThanOrEqual(
      end_date_time.getTime()
    );

    expect(new Date(search_result[2].timestamp).getTime()).toBeGreaterThanOrEqual(
      start_date_time.getTime()
    );
    expect(new Date(search_result[2].timestamp).getTime()).toBeLessThanOrEqual(
      end_date_time.getTime()
    );

    expect(mock_audit_log_exporter.queryAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        start_date_time,
        end_date_time,
        user_id,
        operation_type
      })
    );

    expect(mock_audit_log_exporter.queryAuditLog).toHaveBeenCalledTimes(1);
  });
});