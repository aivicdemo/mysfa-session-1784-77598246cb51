import { filterActivitiesByTimestamp } from '../../src/logic/it-1';

describe('顧客レコード画面の活動記録フィルタリング', () => {
  // SCEN-419
  test('同じタイムスタンプを持つ複数の活動記録がフィルタされた場合、すべてが返される', () => {
    const common_timestamp = '2024-01-15T10:30:00Z';
    
    const activity_record_1 = {
      id: 'activity_001',
      type: '電話',
      sales_person: '田中太郎',
      customer: '顧客A',
      timestamp: common_timestamp,
    };
    
    const activity_record_2 = {
      id: 'activity_002',
      type: 'メール',
      sales_person: '鈴木花子',
      customer: '顧客B',
      timestamp: common_timestamp,
    };
    
    const activity_record_3 = {
      id: 'activity_003',
      type: '訪問',
      sales_person: '佐藤次郎',
      customer: '顧客C',
      timestamp: common_timestamp,
    };
    
    const all_activities = [
      activity_record_1,
      activity_record_2,
      activity_record_3,
    ];
    
    const filter_condition = {
      timestamp: common_timestamp,
    };
    
    const filter_result = filterActivitiesByTimestamp(all_activities, filter_condition);
    
    expect(filter_result).toHaveLength(3);
    expect(filter_result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'activity_001',
          type: '電話',
          sales_person: '田中太郎',
          customer: '顧客A',
          timestamp: common_timestamp,
        }),
        expect.objectContaining({
          id: 'activity_002',
          type: 'メール',
          sales_person: '鈴木花子',
          customer: '顧客B',
          timestamp: common_timestamp,
        }),
        expect.objectContaining({
          id: 'activity_003',
          type: '訪問',
          sales_person: '佐藤次郎',
          customer: '顧客C',
          timestamp: common_timestamp,
        }),
      ])
    );
  });
});