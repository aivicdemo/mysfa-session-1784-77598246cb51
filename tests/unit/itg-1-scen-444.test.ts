import { fetchCustomerActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の商談履歴・活動記録表示', () => {
  test('SCEN-444: 活動記録が複数件の顧客レコードを表示するとき、すべてのレコードが返される', async () => {
    // 前提: 営業管理システムに顧客レコードが登録され、該当顧客に5件以上の活動記録が存在する状態
    const customer_id = 'CUST-12345';
    const expected_activity_count = 7;
    
    const mock_activity_records = [
      {
        activity_id: 'ACT-001',
        customer_id: customer_id,
        activity_type: 'email',
        activity_date: '2024-01-10T09:00:00Z',
        description: 'Initial contact email',
        created_at: '2024-01-10T09:00:00Z'
      },
      {
        activity_id: 'ACT-002',
        customer_id: customer_id,
        activity_type: 'phone',
        activity_date: '2024-01-12T14:30:00Z',
        description: 'Phone call discussion',
        created_at: '2024-01-12T14:30:00Z'
      },
      {
        activity_id: 'ACT-003',
        customer_id: customer_id,
        activity_type: 'visit',
        activity_date: '2024-01-15T10:00:00Z',
        description: 'Office visit',
        created_at: '2024-01-15T10:00:00Z'
      },
      {
        activity_id: 'ACT-004',
        customer_id: customer_id,
        activity_type: 'email',
        activity_date: '2024-01-18T11:00:00Z',
        description: 'Follow-up email',
        created_at: '2024-01-18T11:00:00Z'
      },
      {
        activity_id: 'ACT-005',
        customer_id: customer_id,
        activity_type: 'phone',
        activity_date: '2024-01-20T15:00:00Z',
        description: 'Confirmation call',
        created_at: '2024-01-20T15:00:00Z'
      },
      {
        activity_id: 'ACT-006',
        customer_id: customer_id,
        activity_type: 'email',
        activity_date: '2024-01-22T09:30:00Z',
        description: 'Proposal sent',
        created_at: '2024-01-22T09:30:00Z'
      },
      {
        activity_id: 'ACT-007',
        customer_id: customer_id,
        activity_type: 'visit',
        activity_date: '2024-01-25T14:00:00Z',
        description: 'Final negotiation visit',
        created_at: '2024-01-25T14:00:00Z'
      }
    ];

    // 発生条件: 営業担当者が顧客レコード画面で活動記録を表示する操作を実行したとき
    const result = await fetchCustomerActivityRecords(customer_id);

    // 期待結果: すべての活動記録が返却され、件数がデータベースの総件数と完全に一致する
    expect(result).toEqual({
      customer_id: customer_id,
      activity_records: mock_activity_records,
      total_count: expected_activity_count,
      displayed_count: expected_activity_count,
      sorted_by_date_desc: true
    });

    // 期待結果: 表示されている活動記録の件数がデータベース保存件数と完全に一致
    expect(result.total_count).toBe(expected_activity_count);
    expect(result.displayed_count).toBe(expected_activity_count);

    // 期待結果: すべてのレコードが漏れなく返されている
    expect(result.activity_records.length).toBe(expected_activity_count);

    // 期待結果: 活動記録が最新順（新しい順）にソートされていることを確認
    expect(result.sorted_by_date_desc).toBe(true);
    for (let i = 0; i < result.activity_records.length - 1; i++) {
      const current_date = new Date(result.activity_records[i].activity_date).getTime();
      const next_date = new Date(result.activity_records[i + 1].activity_date).getTime();
      expect(current_date).toBeGreaterThanOrEqual(next_date);
    }

    // 期待結果: スクロール後も活動記録の件数が変わらず、最終行まで確認可能
    const result_after_scroll = await fetchCustomerActivityRecords(customer_id);
    expect(result_after_scroll.total_count).toBe(expected_activity_count);
    expect(result_after_scroll.displayed_count).toBe(expected_activity_count);
    expect(result_after_scroll.activity_records.length).toBe(expected_activity_count);

    // 期待結果: 活動記録100%が表示されている
    const display_percentage = (result.displayed_count / result.total_count) * 100;
    expect(display_percentage).toBe(100);
  });
});