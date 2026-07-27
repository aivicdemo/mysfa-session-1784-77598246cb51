import { filterActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の活動記録フィルタリング機能', () => {
  // SCEN-412
  test('フィルタ適用前に複数件の活動記録が存在し、選択タイプと一致する件数が0件の場合、0件が返される', () => {
    // 事前登録: フィルタ条件に一致しない複数件の活動記録
    const activityRecords = [
      {
        id: 'activity_001',
        type: '電話',
        date: '2024-01-15',
        customerId: 'customer_001',
        content: 'Telephone call',
      },
      {
        id: 'activity_002',
        type: 'メール',
        date: '2024-01-16',
        customerId: 'customer_001',
        content: 'Email sent',
      },
      {
        id: 'activity_003',
        type: '訪問',
        date: '2024-01-17',
        customerId: 'customer_001',
        content: 'On-site visit',
      },
      {
        id: 'activity_004',
        type: 'メール',
        date: '2024-01-18',
        customerId: 'customer_001',
        content: 'Email follow-up',
      },
    ];

    // フィルタ条件: タイプ=提案（活動記録内に該当する件数なし）
    const filterCondition = {
      type: '提案',
      customerId: 'customer_001',
    };

    // 関数実行
    const result = filterActivityRecords(activityRecords, filterCondition);

    // 期待結果: 件数ゼロが返される
    expect(result.records).toEqual([]);
    expect(result.count).toBe(0);
    expect(result.message).toBe('該当する活動記録がありません');
  });
});