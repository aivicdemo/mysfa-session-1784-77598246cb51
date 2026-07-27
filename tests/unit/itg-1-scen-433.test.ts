import { filterActivityRecordsByDateRange } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-433: [edge] 活動記録フィルタリング機能 - 年をまたいだ日付を持つ活動記録がフィルタされた場合、時系列順が保たれる
  test('年をまたいだ日付を含む活動記録がフィルタされたとき、時系列順（昇順）が保たれることを確認', () => {
    // テストデータ準備
    const activityRecords = [
      {
        id: 'activity_a',
        type: 'visit',
        datetime: new Date('2023-12-28T14:30:00Z'),
        description: '営業訪問',
      },
      {
        id: 'activity_b',
        type: 'phone',
        datetime: new Date('2024-01-02T09:15:00Z'),
        description: '電話フォローアップ',
      },
      {
        id: 'activity_c',
        type: 'email',
        datetime: new Date('2023-12-15T11:00:00Z'),
        description: 'メール送信',
      },
      {
        id: 'activity_d',
        type: 'proposal',
        datetime: new Date('2024-01-15T16:45:00Z'),
        description: '提案提出',
      },
      {
        id: 'activity_e',
        type: 'quotation',
        datetime: new Date('2024-01-05T13:20:00Z'),
        description: '見積提示',
      },
    ];

    const startDate = new Date('2023-12-15T00:00:00Z');
    const endDate = new Date('2024-01-15T23:59:59Z');

    // 活動記録フィルタリング機能を実行
    const filteredRecords = filterActivityRecordsByDateRange(
      activityRecords,
      startDate,
      endDate,
    );

    // フィルタ結果として5件すべての活動記録が返却されることを確認
    expect(filteredRecords).toHaveLength(5);

    // 期待される時系列順序（昇順）を検証
    const expectedOrder = [
      'activity_c', // 2023年12月15日 11:00
      'activity_a', // 2023年12月28日 14:30
      'activity_b', // 2024年01月02日 09:15
      'activity_e', // 2024年01月05日 13:20
      'activity_d', // 2024年01月15日 16:45
    ];

    filteredRecords.forEach((record, index) => {
      expect(record.id).toBe(expectedOrder[index]);
    });

    // 時系列の連続性を検証（前の記録の日時が後ろの記録の日時より前であること）
    for (let i = 0; i < filteredRecords.length - 1; i++) {
      expect(filteredRecords[i].datetime.getTime()).toBeLessThanOrEqual(
        filteredRecords[i + 1].datetime.getTime(),
      );
    }
  });
});