import { filterActivitiesByType } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  test('SCEN-425: [error] 活動記録フィルタリング機能 - フィルタ対象タイプがundefinedの場合、空配列が返される', () => {
    // 活動記録のサンプルデータを準備
    const sampleActivities = [
      {
        activity_id: 'ACT001',
        activity_type: 'email',
        description: 'Customer inquiry email',
        timestamp: new Date('2024-01-15T10:00:00Z'),
      },
      {
        activity_id: 'ACT002',
        activity_type: 'phone',
        description: 'Sales call',
        timestamp: new Date('2024-01-16T14:30:00Z'),
      },
      {
        activity_id: 'ACT003',
        activity_type: 'visit',
        description: 'On-site visit',
        timestamp: new Date('2024-01-17T09:00:00Z'),
      },
    ];

    // フィルタ対象タイプにundefinedを渡してフィルタリング関数を呼び出す
    const result = filterActivitiesByType(sampleActivities, undefined);

    // 戻り値として空配列 [] が返される
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});