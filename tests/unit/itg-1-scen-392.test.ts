import { fetchPastRecordsTimeline } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示機能', () => {
  // SCEN-392
  test('商談と活動記録が1件のとき、その1件が返される', () => {
    const customer_id = 'CUST-001';
    const deal_record = {
      deal_id: 'DEAL-100',
      deal_name: 'A社 契約更新',
      created_at: new Date('2024-01-15T10:30:00Z'),
      customer_id: customer_id,
    };
    const activity_record = {
      activity_id: 'ACT-200',
      activity_type: '電話',
      executed_at: new Date('2024-01-15T11:00:00Z'),
      customer_id: customer_id,
    };

    const timeline_result = fetchPastRecordsTimeline(
      customer_id,
      [deal_record],
      [activity_record]
    );

    expect(timeline_result).toHaveLength(1);
    expect(timeline_result[0]).toEqual({
      record_id: 'ACT-200',
      record_type: 'activity',
      record_summary: '電話',
      timestamp: new Date('2024-01-15T11:00:00Z'),
    });
  });
});