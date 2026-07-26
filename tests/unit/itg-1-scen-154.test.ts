import { filterActivityRecordsByType } from '../../src/logic/it-1';

describe('顧客レコード画面の活動記録タイプフィルタリング機能', () => {
  // SCEN-154
  test('選択された活動記録タイプのみが時系列で表示され他のタイプは非表示になる', () => {
    const activity_records = [
      {
        id: 'ACT001',
        type: '電話',
        customer_id: 'CUST001',
        created_at: new Date('2024-01-10T09:00:00Z'),
        description: '初期接触',
      },
      {
        id: 'ACT002',
        type: 'メール',
        customer_id: 'CUST001',
        created_at: new Date('2024-01-12T14:30:00Z'),
        description: 'フォローアップ',
      },
      {
        id: 'ACT003',
        type: '訪問',
        customer_id: 'CUST001',
        created_at: new Date('2024-01-15T11:00:00Z'),
        description: 'オフィス訪問',
      },
      {
        id: 'ACT004',
        type: '電話',
        customer_id: 'CUST001',
        created_at: new Date('2024-01-18T10:15:00Z'),
        description: '見積説明',
      },
      {
        id: 'ACT005',
        type: '提案',
        customer_id: 'CUST001',
        created_at: new Date('2024-01-20T15:45:00Z'),
        description: '提案資料送付',
      },
      {
        id: 'ACT006',
        type: '電話',
        customer_id: 'CUST001',
        created_at: new Date('2024-01-22T13:20:00Z'),
        description: '契約条件調整',
      },
    ];

    // フィルタ条件1: 電話タイプのみを選択
    const filtered_by_phone = filterActivityRecordsByType(
      activity_records,
      ['電話'],
      'desc'
    );

    expect(filtered_by_phone).toHaveLength(3);
    expect(filtered_by_phone[0].id).toBe('ACT006');
    expect(filtered_by_phone[0].type).toBe('電話');
    expect(filtered_by_phone[0].created_at).toEqual(
      new Date('2024-01-22T13:20:00Z')
    );
    expect(filtered_by_phone[1].id).toBe('ACT004');
    expect(filtered_by_phone[1].type).toBe('電話');
    expect(filtered_by_phone[1].created_at).toEqual(
      new Date('2024-01-18T10:15:00Z')
    );
    expect(filtered_by_phone[2].id).toBe('ACT001');
    expect(filtered_by_phone[2].type).toBe('電話');
    expect(filtered_by_phone[2].created_at).toEqual(
      new Date('2024-01-10T09:00:00Z')
    );

    // フィルタ条件2: メールタイプのみを選択
    const filtered_by_email = filterActivityRecordsByType(
      activity_records,
      ['メール'],
      'desc'
    );

    expect(filtered_by_email).toHaveLength(1);
    expect(filtered_by_email[0].id).toBe('ACT002');
    expect(filtered_by_email[0].type).toBe('メール');
    expect(filtered_by_email[0].created_at).toEqual(
      new Date('2024-01-12T14:30:00Z')
    );

    // フィルタ条件3: 複数タイプ（電話、訪問）を選択
    const filtered_by_phone_and_visit = filterActivityRecordsByType(
      activity_records,
      ['電話', '訪問'],
      'desc'
    );

    expect(filtered_by_phone_and_visit).toHaveLength(4);
    expect(filtered_by_phone_and_visit[0].id).toBe('ACT006');
    expect(filtered_by_phone_and_visit[0].type).toBe('電話');
    expect(filtered_by_phone_and_visit[1].id).toBe('ACT004');
    expect(filtered_by_phone_and_visit[1].type).toBe('電話');
    expect(filtered_by_phone_and_visit[2].id).toBe('ACT003');
    expect(filtered_by_phone_and_visit[2].type).toBe('訪問');
    expect(filtered_by_phone_and_visit[3].id).toBe('ACT001');
    expect(filtered_by_phone_and_visit[3].type).toBe('電話');

    // フィルタ条件4: 昇順で表示
    const filtered_by_phone_asc = filterActivityRecordsByType(
      activity_records,
      ['電話'],
      'asc'
    );

    expect(filtered_by_phone_asc).toHaveLength(3);
    expect(filtered_by_phone_asc[0].id).toBe('ACT001');
    expect(filtered_by_phone_asc[0].created_at).toEqual(
      new Date('2024-01-10T09:00:00Z')
    );
    expect(filtered_by_phone_asc[2].id).toBe('ACT006');
    expect(filtered_by_phone_asc[2].created_at).toEqual(
      new Date('2024-01-22T13:20:00Z')
    );

    // 非選択タイプが完全に非表示であることを確認
    const contains_email = filtered_by_phone.some((record) => record.type === 'メール');
    const contains_visit = filtered_by_phone.some((record) => record.type === '訪問');
    const contains_proposal = filtered_by_phone.some((record) => record.type === '提案');

    expect(contains_email).toBe(false);
    expect(contains_visit).toBe(false);
    expect(contains_proposal).toBe(false);

    // 空配列フィルタのエラー検証
    expect(() => {
      filterActivityRecordsByType(activity_records, [], 'desc');
    }).toThrow(/フィルタ/);
  });
});