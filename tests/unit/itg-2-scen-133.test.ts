import { approveInvoice } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-133: [normal] 請求書承認検証機能 - 承認者が「経理管理者」ロールを保有するとき、承認権限を付与する
  test('承認者が経理管理者ロールを保有するとき、請求書承認APIが正常に処理され、ステータスが承認済みに更新される', async () => {
    const user_id = 'user_approver_001';
    const invoice_id = 'invoice_20240115_001';
    const approval_decision = 'approved';
    const timestamp_utc = new Date('2024-01-15T11:30:00Z');
    const role_name = '経理管理者';
    const expected_invoice_status = '承認済み';
    const expected_http_status_code = 200;
    const operation_type = '請求書承認';

    const mock_identity_provider_adapter = {
      authenticateUser: jest.fn().mockResolvedValue({
        token: 'mock_auth_token_12345',
        user_id: user_id,
        expires_in: 3600,
      }),
      validateToken: jest.fn().mockResolvedValue({
        valid: true,
        user_id: user_id,
        roles: [role_name],
      }),
      refreshToken: jest.fn().mockResolvedValue({
        token: 'mock_auth_token_refreshed',
      }),
      revokeSession: jest.fn().mockResolvedValue({
        success: true,
      }),
    };

    const mock_audit_log_exporter = {
      logUserAccess: jest.fn().mockResolvedValue({
        logged: true,
      }),
      logDataAccess: jest.fn().mockResolvedValue({
        logged: true,
      }),
      logPermissionChange: jest.fn().mockResolvedValue({
        logged: true,
        log_id: 'audit_log_perm_change_001',
      }),
      queryAuditLog: jest.fn().mockResolvedValue({
        logs: [],
      }),
    };

    const mock_database = {
      users: [
        {
          user_id: user_id,
          role: role_name,
          email: 'approver@example.com',
          name: 'Approver User',
        },
      ],
      invoices: [
        {
          invoice_id: invoice_id,
          status: '未承認',
          amount: 150000,
          customer_id: 'cust_001',
          created_at: '2024-01-15T09:00:00Z',
        },
      ],
      access_logs: [],
    };

    const result = await approveInvoice(
      {
        user_id: user_id,
        invoice_id: invoice_id,
        approval_decision: approval_decision,
      },
      mock_identity_provider_adapter,
      mock_audit_log_exporter,
      mock_database,
      timestamp_utc
    );

    expect(result.http_status_code).toBe(expected_http_status_code);
    expect(result.invoice_status).toBe(expected_invoice_status);
    expect(result.message).toMatch(/承認完了/);

    expect(mock_identity_provider_adapter.validateToken).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: user_id })
    );

    expect(mock_audit_log_exporter.logPermissionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: user_id,
        operation_type: operation_type,
        timestamp: expect.any(Date),
      })
    );

    const logged_permission_change = mock_audit_log_exporter.logPermissionChange.mock.calls[0][0];
    expect(logged_permission_change.user_id).toBe(user_id);
    expect(logged_permission_change.operation_type).toBe(operation_type);
    expect(logged_permission_change.timestamp).toEqual(timestamp_utc);

    const updated_invoice = mock_database.invoices.find(
      (inv) => inv.invoice_id === invoice_id
    );
    expect(updated_invoice.status).toBe(expected_invoice_status);
  });
});