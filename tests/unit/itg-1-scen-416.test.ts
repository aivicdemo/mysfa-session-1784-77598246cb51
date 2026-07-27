import { filterCustomerActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の活動記録フィルタリング機能', () => {
  test('SCEN-416: 複数タイプが混在する活動記録から訪問タイプのみがフィルタされて返される', () => {
    // 準備: テストデータ - 複数タイプの活動記録を混在させる
    const mixedActivityRecords = [
      {
        id: 'activity_001',
        customerId: 'cust_001',
        type: '訪問',
        description: '顧客A訪問',
        recordedAt: new Date('2024-01-15T09:00:00Z'),
      },
      {
        id: 'activity_002',
        customerId: 'cust_001',
        type: '電話',
        description: '顧客A電話1',
        recordedAt: new Date('2024-01-15T10:00:00Z'),
      },
      {
        id: 'activity_003',
        customerId: 'cust_001',
        type: '訪問',
        description: '顧客A訪問2',
        recordedAt: new Date('2024-01-15T11:00:00Z'),
      },
      {
        id: 'activity_004',
        customerId: 'cust_001',
        type: 'メール',
        description: '顧客Aメール1',
        recordedAt: new Date('2024-01-15T12:00:00Z'),
      },
      {
        id: 'activity_005',
        customerId: 'cust_001',
        type: '電話',
        description: '顧客A電話2',
        recordedAt: new Date('2024-01-15T13:00:00Z'),
      },
      {
        id: 'activity_006',
        customerId: 'cust_001',
        type: '訪問',
        description: '顧客A訪問3',
        recordedAt: new Date('2024-01-15T14:00:00Z'),
      },
      {
        id: 'activity_007',
        customerId: 'cust_001',
        type: 'メール',
        description: '顧客Aメール2',
        recordedAt: new Date('2024-01-15T15:00:00Z'),
      },
    ];

    // 実行: フィルタ条件『タイプ=訪問』を指定してフィルタリング実行
    const filteredRecords = filterCustomerActivityRecords(
      mixedActivityRecords,
      { type: '訪問' }
    );

    // 検証: フィルタリング結果は訪問タイプのみ3件
    expect(filteredRecords).toHaveLength(3);

    // 検証: 返却されたレコードの全てのタイプが『訪問』
    filteredRecords.forEach((record) => {
      expect(record.type).toBe('訪問');
    });

    // 検証: 返却されたレコードは期待の訪問レコード
    expect(filteredRecords[0].id).toBe('activity_001');
    expect(filteredRecords[1].id).toBe('activity_003');
    expect(filteredRecords[2].id).toBe('activity_006');

    // 検証: 電話とメールタイプのレコードは含まれない
    expect(
      filteredRecords.some((record) => record.type === '電話')
    ).toBe(false);
    expect(
      filteredRecords.some((record) => record.type === 'メール')
    ).toBe(false);
  });
});