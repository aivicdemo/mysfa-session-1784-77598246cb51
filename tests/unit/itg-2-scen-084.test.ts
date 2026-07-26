import { determineAccessPermissions } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-084
  test('複数ロールが割り当てられたユーザーが、全ロールの権限に基づいてアクセス可能になる', () => {
    const test_user_id = 'user_multi_role_001';
    const assigned_roles = [
      {
        role_id: 'admin_role',
        role_name: 'Administrator',
        permissions: [
          'user_management',
          'system_settings',
          'customer_info_view',
          'report_view'
        ]
      },
      {
        role_id: 'sales_role',
        role_name: 'Sales Representative',
        permissions: [
          'customer_info_edit',
          'deal_view',
          'deal_create',
          'report_view'
        ]
      },
      {
        role_id: 'report_role',
        role_name: 'Report Viewer',
        permissions: [
          'report_view',
          'report_export'
        ]
      }
    ];

    const result = determineAccessPermissions({
      user_id: test_user_id,
      assigned_roles: assigned_roles
    });

    // Verify admin-only permission is accessible
    expect(result.accessible_features).toContain('user_management');
    expect(result.accessible_features).toContain('system_settings');

    // Verify sales-only permission is accessible
    expect(result.accessible_features).toContain('customer_info_edit');
    expect(result.accessible_features).toContain('deal_view');
    expect(result.accessible_features).toContain('deal_create');

    // Verify report-only permission is accessible
    expect(result.accessible_features).toContain('report_export');

    // Verify common permissions across multiple roles
    expect(result.accessible_features).toContain('customer_info_view');
    expect(result.accessible_features).toContain('report_view');

    // Verify no duplicate features
    const unique_features = new Set(result.accessible_features);
    expect(unique_features.size).toBe(8);

    // Verify restricted features are not accessible
    expect(result.restricted_features).toContain('billing_management');
    expect(result.restricted_features).toContain('audit_logs');
    expect(result.restricted_features).toContain('system_maintenance');

    // Verify integrated role information
    expect(result.integrated_roles).toHaveLength(3);
    expect(result.integrated_roles.map((r: any) => r.role_id)).toEqual([
      'admin_role',
      'sales_role',
      'report_role'
    ]);

    // Verify permission integration is correct
    expect(result.total_accessible_count).toBe(8);
    expect(result.total_restricted_count).toBe(3);

    // Verify access control status
    expect(result.access_control_active).toBe(true);
    expect(result.multi_role_integration_verified).toBe(true);
  });
});