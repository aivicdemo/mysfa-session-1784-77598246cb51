import { getActivityHistoryWithStableSort } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-192: [edge] 商談・活動履歴の時系列表示機能 - 同一タイムスタンプの記録が存在する場合、安定したソート順序が保証される
  test('同一タイムスタンプを持つ活動履歴レコードについて、すべてのリロード・キャッシュクリア後においても安定したソート順序が保証される', () => {
    const shared_timestamp = new Date('2024-01-15T10:30:00Z');

    const activity_record_1 = {
      activity_id: 'ACT-001',
      activity_type: 'email',
      timestamp: shared_timestamp,
      customer_id: 'CUST-100',
      deal_id: 'DEAL-001',
      created_at: new Date('2024-01-15T10:00:00Z'),
    };

    const activity_record_2 = {
      activity_id: 'ACT-002',
      activity_type: 'phone',
      timestamp: shared_timestamp,
      customer_id: 'CUST-100',
      deal_id: 'DEAL-001',
      created_at: new Date('2024-01-15T10:05:00Z'),
    };

    const activity_record_3 = {
      activity_id: 'ACT-003',
      activity_type: 'visit',
      timestamp: shared_timestamp,
      customer_id: 'CUST-100',
      deal_id: 'DEAL-001',
      created_at: new Date('2024-01-15T10:10:00Z'),
    };

    const activity_record_4 = {
      activity_id: 'ACT-004',
      activity_type: 'email',
      timestamp: new Date('2024-01-15T10:29:59Z'),
      customer_id: 'CUST-100',
      deal_id: 'DEAL-001',
      created_at: new Date('2024-01-15T09:50:00Z'),
    };

    const activity_record_5 = {
      activity_id: 'ACT-005',
      activity_type: 'phone',
      timestamp: new Date('2024-01-15T10:30:01Z'),
      customer_id: 'CUST-100',
      deal_id: 'DEAL-001',
      created_at: new Date('2024-01-15T10:20:00Z'),
    };

    const input_activities = [
      activity_record_2,
      activity_record_4,
      activity_record_1,
      activity_record_5,
      activity_record_3,
    ];

    // 第1回目のソート結果
    const first_sort_result = getActivityHistoryWithStableSort(input_activities);

    // 第2回目のソート結果（キャッシュなし再取得を模擬）
    const second_sort_result = getActivityHistoryWithStableSort(input_activities);

    // 第3回目のソート結果
    const third_sort_result = getActivityHistoryWithStableSort(input_activities);

    // 期待される順序: timestamp降順 → 同一タイムスタンプ内ではcreated_at昇順
    // [ACT-005 (10:30:01)] → [ACT-001,002,003 (10:30:00で created_at昇順)] → [ACT-004 (10:29:59)]
    const expected_order = [
      'ACT-005',
      'ACT-001',
      'ACT-002',
      'ACT-003',
      'ACT-004',
    ];

    // 1回目の結果検証
    expect(first_sort_result).toHaveLength(5);
    const first_result_ids = first_sort_result.map((r) => r.activity_id);
    expect(first_result_ids).toEqual(expected_order);

    // 2回目の結果検証（安定性1回目)
    expect(second_sort_result).toHaveLength(5);
    const second_result_ids = second_sort_result.map((r) => r.activity_id);
    expect(second_result_ids).toEqual(expected_order);
    expect(second_result_ids).toEqual(first_result_ids);

    // 3回目の結果検証（安定性2回目)
    expect(third_sort_result).toHaveLength(5);
    const third_result_ids = third_sort_result.map((r) => r.activity_id);
    expect(third_result_ids).toEqual(expected_order);
    expect(third_result_ids).toEqual(first_result_ids);

    // 同一タイムスタンプのレコード（ACT-001, ACT-002, ACT-003）の相対順序が一貫していることを検証
    const shared_ts_records_first = first_sort_result.filter(
      (r) => r.timestamp.getTime() === shared_timestamp.getTime()
    );
    const shared_ts_records_second = second_sort_result.filter(
      (r) => r.timestamp.getTime() === shared_timestamp.getTime()
    );
    const shared_ts_records_third = third_sort_result.filter(
      (r) => r.timestamp.getTime() === shared_timestamp.getTime()
    );

    expect(shared_ts_records_first).toHaveLength(3);
    expect(shared_ts_records_second).toHaveLength(3);
    expect(shared_ts_records_third).toHaveLength(3);

    const shared_ts_order_first = shared_ts_records_first.map(
      (r) => r.activity_id
    );
    const shared_ts_order_second = shared_ts_records_second.map(
      (r) => r.activity_id
    );
    const shared_ts_order_third = shared_ts_records_third.map(
      (r) => r.activity_id
    );

    expect(shared_ts_order_first).toEqual(['ACT-001', 'ACT-002', 'ACT-003']);
    expect(shared_ts_order_second).toEqual(shared_ts_order_first);
    expect(shared_ts_order_third).toEqual(shared_ts_order_first);

    // timestamp順序が降順であることを検証
    for (let i = 0; i < first_sort_result.length - 1; i++) {
      expect(
        first_sort_result[i].timestamp.getTime()
      ).toBeGreaterThanOrEqual(
        first_sort_result[i + 1].timestamp.getTime()
      );
    }

    // 全結果がすべてのリロード後で同一の配列構造を保つ
    expect(first_sort_result).toEqual(second_sort_result);
    expect(second_sort_result).toEqual(third_sort_result);
  });
});