import { filterActivityRecordsByTypes } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  test('SCEN-155: [normal] 活動記録タイプフィルタリング機能 - 複数の活動記録タイプを同時にフィルタした場合に全てのタイプが正しく表示される', () => {
    const activity_records = [
      {
        id: 'ACT001',
        customer_id: 'CUST001',
        activity_type: 'phone',
        activity_date: '2024-01-15T10:00:00Z',
        description: 'Phone call with customer'
      },
      {
        id: 'ACT002',
        customer_id: 'CUST001',
        activity_type: 'email',
        activity_date: '2024-01-14T09:30:00Z',
        description: 'Email sent to customer'
      },
      {
        id: 'ACT003',
        customer_id: 'CUST001',
        activity_type: 'visit',
        activity_date: '2024-01-13T14:00:00Z',
        description: 'On-site visit'
      },
      {
        id: 'ACT004',
        customer_id: 'CUST001',
        activity_type: 'phone',
        activity_date: '2024-01-12T11:00:00Z',
        description: 'Follow-up phone call'
      },
      {
        id: 'ACT005',
        customer_id: 'CUST001',
        activity_type: 'memo',
        activity_date: '2024-01-11T08:00:00Z',
        description: 'Internal memo'
      }
    ];

    const selected_types = ['phone', 'email', 'visit'];
    const result = filterActivityRecordsByTypes(activity_records, selected_types);

    expect(result).toHaveLength(4);
    expect(result[0].id).toBe('ACT001');
    expect(result[0].activity_type).toBe('phone');
    expect(result[1].id).toBe('ACT002');
    expect(result[1].activity_type).toBe('email');
    expect(result[2].id).toBe('ACT003');
    expect(result[2].activity_type).toBe('visit');
    expect(result[3].id).toBe('ACT004');
    expect(result[3].activity_type).toBe('phone');

    const activity_types_in_result = result.map((rec) => rec.activity_type);
    expect(activity_types_in_result).toContain('phone');
    expect(activity_types_in_result).toContain('email');
    expect(activity_types_in_result).toContain('visit');
    expect(activity_types_in_result).not.toContain('memo');

    expect(result.some((rec) => rec.id === 'ACT005')).toBe(false);
  });
});