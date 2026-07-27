import { filterActivityRecordsByType } from '../../src/logic/it-1';

describe('顧客レコード画面の活動記録フィルタリング機能', () => {
  // SCEN-415
  test('複数タイプが混在する活動記録から、電話タイプのみがフィルタされて返される', () => {
    const mixedActivities = [
      {
        id: 'act_001',
        type: '電話',
        customerId: 'cust_A',
        description: '顧客確認電話',
        timestamp: new Date('2024-01-15T09:00:00Z'),
      },
      {
        id: 'act_002',
        type: 'メール',
        customerId: 'cust_A',
        description: '提案資料送付',
        timestamp: new Date('2024-01-15T10:30:00Z'),
      },
      {
        id: 'act_003',
        type: '訪問',
        customerId: 'cust_A',
        description: '顧客訪問',
        timestamp: new Date('2024-01-15T14:00:00Z'),
      },
      {
        id: 'act_004',
        type: '電話',
        customerId: 'cust_A',
        description: '進捗確認',
        timestamp: new Date('2024-01-16T11:00:00Z'),
      },
      {
        id: 'act_005',
        type: 'その他',
        customerId: 'cust_A',
        description: 'チャット',
        timestamp: new Date('2024-01-16T15:30:00Z'),
      },
    ];

    const filterType = '電話';
    const filtered = filterActivityRecordsByType(mixedActivities, filterType);

    expect(filtered).toHaveLength(2);
    expect(filtered[0].id).toBe('act_001');
    expect(filtered[0].type).toBe('電話');
    expect(filtered[1].id).toBe('act_004');
    expect(filtered[1].type).toBe('電話');
    expect(filtered.every((record) => record.type === '電話')).toBe(true);
  });
});