import { filterActivityRecordsByMonthEnd } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-432: [edge] 活動記録フィルタリング機能 - 月末の日付を持つ活動記録がフィルタされた場合、正しく結果に含まれる
  test('月末の日付を持つ活動記録のみがフィルタリング結果に含まれること', () => {
    const activity_record_1 = {
      activity_id: 'ACT-001',
      activity_date: new Date('2024-01-31'),
      salesperson_name: '営業担当者A',
      customer_name: '顧客X',
      activity_type: '訪問',
      activity_content: '訪問'
    };

    const activity_record_2 = {
      activity_id: 'ACT-002',
      activity_date: new Date('2024-02-28'),
      salesperson_name: '営業担当者B',
      customer_name: '顧客Y',
      activity_type: '電話商談',
      activity_content: '電話商談'
    };

    const activity_record_3 = {
      activity_id: 'ACT-003',
      activity_date: new Date('2024-03-31'),
      salesperson_name: '営業担当者C',
      customer_name: '顧客Z',
      activity_type: 'メール送信',
      activity_content: 'メール送信'
    };

    const activity_record_4 = {
      activity_id: 'ACT-004',
      activity_date: new Date('2024-04-15'),
      salesperson_name: '営業担当者A',
      customer_name: '顧客X',
      activity_type: '提案資料送付',
      activity_content: '提案資料送付'
    };

    const all_activity_records = [
      activity_record_1,
      activity_record_2,
      activity_record_3,
      activity_record_4
    ];

    const filtered_results = filterActivityRecordsByMonthEnd(all_activity_records);

    expect(filtered_results).toHaveLength(3);

    expect(filtered_results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          activity_id: 'ACT-001',
          activity_date: new Date('2024-01-31'),
          salesperson_name: '営業担当者A',
          customer_name: '顧客X',
          activity_content: '訪問'
        }),
        expect.objectContaining({
          activity_id: 'ACT-002',
          activity_date: new Date('2024-02-28'),
          salesperson_name: '営業担当者B',
          customer_name: '顧客Y',
          activity_content: '電話商談'
        }),
        expect.objectContaining({
          activity_id: 'ACT-003',
          activity_date: new Date('2024-03-31'),
          salesperson_name: '営業担当者C',
          customer_name: '顧客Z',
          activity_content: 'メール送信'
        })
      ])
    );

    const activity_record_4_included = filtered_results.some(
      record => record.activity_id === 'ACT-004'
    );
    expect(activity_record_4_included).toBe(false);
  });
});