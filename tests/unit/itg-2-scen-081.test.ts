import { checkAccessPermission } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-081
  test('ユーザーが割り当てられたロールに基づいて、対応する機能にアクセスできる', () => {
    // 管理者ロールでアクセステスト
    const admin_user_id = 'user_admin_001';
    const admin_role = 'admin';
    const admin_result = checkAccessPermission({
      user_id: admin_user_id,
      role: admin_role,
      feature: 'dashboard_admin'
    });
    expect(admin_result.is_permitted).toBe(true);
    expect(admin_result.accessible_features).toEqual([
      'dashboard_admin',
      'customer_management',
      'sales_management',
      'user_management',
      'order_history',
      'profile_edit'
    ]);

    // 顧客ロールでアクセステスト
    const customer_user_id = 'user_customer_001';
    const customer_role = 'customer';
    const customer_result = checkAccessPermission({
      user_id: customer_user_id,
      role: customer_role,
      feature: 'dashboard_admin'
    });
    expect(customer_result.is_permitted).toBe(false);
    expect(customer_result.accessible_features).toEqual([
      'order_history',
      'profile_edit'
    ]);
    expect(customer_result.error_message).toMatch(/権限/);

    // 販売担当者ロールでアクセステスト
    const sales_user_id = 'user_sales_001';
    const sales_role = 'sales';
    const sales_result = checkAccessPermission({
      user_id: sales_user_id,
      role: sales_role,
      feature: 'customer_management'
    });
    expect(sales_result.is_permitted).toBe(true);
    expect(sales_result.accessible_features).toEqual([
      'customer_management',
      'sales_management',
      'order_history',
      'profile_edit'
    ]);

    // 販売担当者が管理者機能にアクセス試行
    const sales_admin_attempt = checkAccessPermission({
      user_id: sales_user_id,
      role: sales_role,
      feature: 'user_management'
    });
    expect(sales_admin_attempt.is_permitted).toBe(false);
    expect(sales_admin_attempt.error_message).toMatch(/権限/);

    // 顧客が管理者機能にアクセス試行
    const customer_admin_attempt = checkAccessPermission({
      user_id: customer_user_id,
      role: customer_role,
      feature: 'customer_management'
    });
    expect(customer_admin_attempt.is_permitted).toBe(false);
    expect(customer_admin_attempt.error_message).toMatch(/権限/);

    // 各ロールが利用可能な機能のアクセステスト
    const customer_order_history = checkAccessPermission({
      user_id: customer_user_id,
      role: customer_role,
      feature: 'order_history'
    });
    expect(customer_order_history.is_permitted).toBe(true);

    const customer_profile_edit = checkAccessPermission({
      user_id: customer_user_id,
      role: customer_role,
      feature: 'profile_edit'
    });
    expect(customer_profile_edit.is_permitted).toBe(true);

    const sales_order_history = checkAccessPermission({
      user_id: sales_user_id,
      role: sales_role,
      feature: 'order_history'
    });
    expect(sales_order_history.is_permitted).toBe(true);

    const sales_profile_edit = checkAccessPermission({
      user_id: sales_user_id,
      role: sales_role,
      feature: 'profile_edit'
    });
    expect(sales_profile_edit.is_permitted).toBe(true);

    const admin_order_history = checkAccessPermission({
      user_id: admin_user_id,
      role: admin_role,
      feature: 'order_history'
    });
    expect(admin_order_history.is_permitted).toBe(true);

    const admin_profile_edit = checkAccessPermission({
      user_id: admin_user_id,
      role: admin_role,
      feature: 'profile_edit'
    });
    expect(admin_profile_edit.is_permitted).toBe(true);
  });
});