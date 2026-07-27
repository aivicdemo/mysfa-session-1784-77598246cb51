import { validateInvoiceApprovalPermission } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-144: [error] 請求書承認検証機能 - 承認者がユーザー権限マスタで無効状態のとき、権限エラーが発生する
  test('should throw permission error when approver has disabled status in user permissions master', () => {
    const approver_user_id = 'approver_001';
    const invoice_id = 'INV-2024-001';
    const invoice_status = 'pending_approval';

    const disabled_permission_status = 'disabled';

    const user_permissions_master = {
      user_id: approver_user_id,
      status: disabled_permission_status,
      permission_level: 'invoice_approver'
    };

    const audit_log_exporter_stub = {
      logPermissionChange: jest.fn().mockResolvedValue({
        success: true,
        logged_at: '2024-01-15T11:00:00Z'
      })
    };

    const approval_request_input = {
      invoice_id: invoice_id,
      approver_user_id: approver_user_id,
      current_invoice_status: invoice_status,
      user_permission: user_permissions_master,
      audit_log_exporter: audit_log_exporter_stub
    };

    expect(() =>
      validateInvoiceApprovalPermission(approval_request_input)
    ).toThrow(/権限/);

    expect(audit_log_exporter_stub.logPermissionChange).toHaveBeenCalledWith(
      expect.objectContaining({
        approver_user_id: approver_user_id,
        invoice_id: invoice_id,
        reason: expect.stringMatching(/無効/)
      })
    );
  });
});