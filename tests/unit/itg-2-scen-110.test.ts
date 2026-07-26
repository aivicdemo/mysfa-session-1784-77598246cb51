import { grantPortalAccessOnDealCreation } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-110: [normal] 顧客ポータルアクセス権限自動付与機能 - 営業担当者が商談を新規作成時に顧客企業の担当者にポータルアクセス権限が自動付与される
  test('商談新規作成時に顧客企業担当者にポータルアクセス権限が自動付与され、通知メールが送信される', async () => {
    const dealCreationPayload = {
      customer_name: 'ABC Corporation',
      contact_person_name: 'Yamada Taro',
      contact_email: 'yamada.taro@abccorp.com',
      deal_description: 'Enterprise Software License Agreement',
      deal_amount: 5000000,
      sales_rep_id: 'SALES-001',
      sales_rep_name: 'Suzuki Hanako',
      created_at: '2024-01-15T09:00:00Z'
    };

    const result = await grantPortalAccessOnDealCreation(dealCreationPayload);

    // Assertion 1: 商談作成が成功し、商談 ID が発行されている
    expect(result.deal_id).toMatch(/^DEAL-\d{10}$/);

    // Assertion 2: ポータルアクセス権限が自動付与されている
    expect(result.portal_access_granted).toBe(true);

    // Assertion 3: 権限付与対象のコンタクト情報が正確に記録されている
    expect(result.granted_contact_email).toBe('yamada.taro@abccorp.com');
    expect(result.granted_contact_name).toBe('Yamada Taro');

    // Assertion 4: 権限付与の通知メールが送信されている
    expect(result.notification_email_sent).toBe(true);
    expect(result.notification_email_recipient).toBe('yamada.taro@abccorp.com');
    expect(result.notification_email_timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    // Assertion 5: ユーザー権限レコードが作成されている
    expect(result.user_permission_id).toMatch(/^PERM-\d{10}$/);
    expect(result.user_permission_role).toBe('Customer Portal User');

    // Assertion 6: アクセスログに権限付与イベントが記録されている
    expect(result.access_log_entry_created).toBe(true);
    expect(result.access_log_action_type).toBe('PORTAL_ACCESS_GRANTED');

    // Assertion 7: 顧客企業情報がマスタに登録/更新されている
    expect(result.customer_master_updated).toBe(true);
    expect(result.customer_master_id).toMatch(/^CUST-\d{10}$/);

    // Assertion 8: 処理完了ステータスが正常終了を示している
    expect(result.status).toBe('SUCCESS');
    expect(result.error_message).toBeUndefined();

    // Assertion 9: 権限付与日時が記録されている
    expect(result.access_permission_effective_date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/);

    // Assertion 10: 複合的なレスポンス整合性確認
    expect(result).toHaveProperty('deal_id');
    expect(result).toHaveProperty('portal_access_granted');
    expect(result).toHaveProperty('notification_email_sent');
    expect(result).toHaveProperty('user_permission_id');
    expect(typeof result.deal_id).toBe('string');
    expect(typeof result.portal_access_granted).toBe('boolean');
    expect(typeof result.notification_email_sent).toBe('boolean');
  });
});