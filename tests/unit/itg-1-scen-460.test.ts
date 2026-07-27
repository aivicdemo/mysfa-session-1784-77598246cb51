import { fetchCustomerRecordWithHistoryAndActivities } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-460: [edge] 顧客レコード画面の商談履歴・活動記録表示 - キャッシュ有効期限が0の場合、常に再取得トリガーが発火する
  test('キャッシュ有効期限が0のとき、画面表示のたびに再取得トリガーが発火し常に最新データを取得する', () => {
    // 顧客ID
    const customer_id = 'CUST001';
    
    // キャッシュ設定: 有効期限0
    const cache_config = {
      cache_ttl_seconds: 0,
    };

    // データソースから返される商談履歴・活動記録データ（毎回異なるタイムスタンプを含む）
    const first_fetch_timestamp = '2024-01-15T10:00:00Z';
    const second_fetch_timestamp = '2024-01-15T10:05:00Z';
    const third_fetch_timestamp = '2024-01-15T10:10:00Z';

    const deal_history_first = [
      {
        deal_id: 'DEAL001',
        customer_id: customer_id,
        deal_status: '商談',
        deal_amount: 100000,
        deal_date: '2024-01-10T09:00:00Z',
        updated_at: first_fetch_timestamp,
      },
    ];

    const activity_records_first = [
      {
        activity_id: 'ACT001',
        customer_id: customer_id,
        activity_type: '電話',
        activity_date: '2024-01-15T09:00:00Z',
        activity_description: '顧客との初回通話',
        updated_at: first_fetch_timestamp,
      },
    ];

    const deal_history_second = [
      {
        deal_id: 'DEAL001',
        customer_id: customer_id,
        deal_status: '商談',
        deal_amount: 100000,
        deal_date: '2024-01-10T09:00:00Z',
        updated_at: second_fetch_timestamp,
      },
      {
        deal_id: 'DEAL002',
        customer_id: customer_id,
        deal_status: '新規',
        deal_amount: 50000,
        deal_date: '2024-01-15T10:00:00Z',
        updated_at: second_fetch_timestamp,
      },
    ];

    const activity_records_second = [
      {
        activity_id: 'ACT001',
        customer_id: customer_id,
        activity_type: '電話',
        activity_date: '2024-01-15T09:00:00Z',
        activity_description: '顧客との初回通話',
        updated_at: second_fetch_timestamp,
      },
      {
        activity_id: 'ACT002',
        customer_id: customer_id,
        activity_type: 'メール',
        activity_date: '2024-01-15T10:00:00Z',
        activity_description: '提案資料送付',
        updated_at: second_fetch_timestamp,
      },
    ];

    const deal_history_third = [
      {
        deal_id: 'DEAL001',
        customer_id: customer_id,
        deal_status: '商談',
        deal_amount: 100000,
        deal_date: '2024-01-10T09:00:00Z',
        updated_at: third_fetch_timestamp,
      },
      {
        deal_id: 'DEAL002',
        customer_id: customer_id,
        deal_status: '新規',
        deal_amount: 50000,
        deal_date: '2024-01-15T10:00:00Z',
        updated_at: third_fetch_timestamp,
      },
      {
        deal_id: 'DEAL003',
        customer_id: customer_id,
        deal_status: '初期接触',
        deal_amount: 30000,
        deal_date: '2024-01-15T10:05:00Z',
        updated_at: third_fetch_timestamp,
      },
    ];

    const activity_records_third = [
      {
        activity_id: 'ACT001',
        customer_id: customer_id,
        activity_type: '電話',
        activity_date: '2024-01-15T09:00:00Z',
        activity_description: '顧客との初回通話',
        updated_at: third_fetch_timestamp,
      },
      {
        activity_id: 'ACT002',
        customer_id: customer_id,
        activity_type: 'メール',
        activity_date: '2024-01-15T10:00:00Z',
        activity_description: '提案資料送付',
        updated_at: third_fetch_timestamp,
      },
      {
        activity_id: 'ACT003',
        customer_id: customer_id,
        activity_type: '訪問',
        activity_date: '2024-01-15T10:05:00Z',
        activity_description: '顧客先訪問',
        updated_at: third_fetch_timestamp,
      },
    ];

    // 再取得トリガーをスパイとして監視
    let refetch_trigger_call_count = 0;
    const mock_refetch_trigger = jest.fn(() => {
      refetch_trigger_call_count += 1;
    });

    // キャッシュレイヤーのモック
    let fetch_call_count = 0;
    const mock_cache_layer = jest.fn(() => {
      fetch_call_count += 1;
      if (fetch_call_count === 1) {
        return {
          deal_history: deal_history_first,
          activity_records: activity_records_first,
          fetched_at: first_fetch_timestamp,
        };
      } else if (fetch_call_count === 2) {
        return {
          deal_history: deal_history_second,
          activity_records: activity_records_second,
          fetched_at: second_fetch_timestamp,
        };
      } else {
        return {
          deal_history: deal_history_third,
          activity_records: activity_records_third,
          fetched_at: third_fetch_timestamp,
        };
      }
    });

    // 1. 初回読み込み
    const first_result = fetchCustomerRecordWithHistoryAndActivities(
      customer_id,
      cache_config,
      {
        refetch_trigger: mock_refetch_trigger,
        cache_layer: mock_cache_layer,
      }
    );

    // 初回時、再取得トリガーが1回呼び出されたことを確認
    expect(mock_refetch_trigger).toHaveBeenCalledTimes(1);

    // 初回データが正しく取得されていることを確認
    expect(first_result.deal_history).toEqual(deal_history_first);
    expect(first_result.activity_records).toEqual(activity_records_first);
    expect(first_result.fetched_at).toBe(first_fetch_timestamp);

    // 2. 同一顧客レコード画面内で画面を再表示（タブ切り替え後に戻る）
    const second_result = fetchCustomerRecordWithHistoryAndActivities(
      customer_id,
      cache_config,
      {
        refetch_trigger: mock_refetch_trigger,
        cache_layer: mock_cache_layer,
      }
    );

    // 再取得トリガーが再度呼び出されたことを確認（累計2回）
    expect(mock_refetch_trigger).toHaveBeenCalledTimes(2);

    // 新しいデータが取得されていることを確認（キャッシュからではなくデータソースから）
    expect(second_result.deal_history).toEqual(deal_history_second);
    expect(second_result.activity_records).toEqual(activity_records_second);
    expect(second_result.fetched_at).toBe(second_fetch_timestamp);

    // 初回データと異なることを確認（古いデータが表示されていないこと）
    expect(second_result.deal_history.length).toBeGreaterThan(first_result.deal_history.length);
    expect(second_result.activity_records.length).toBeGreaterThan(first_result.activity_records.length);

    // 3. さらに短時間で画面を複数回再表示
    const third_result = fetchCustomerRecordWithHistoryAndActivities(
      customer_id,
      cache_config,
      {
        refetch_trigger: mock_refetch_trigger,
        cache_layer: mock_cache_layer,
      }
    );

    // 再取得トリガーが再度呼び出されたことを確認（累計3回以上）
    expect(mock_refetch_trigger).toHaveBeenCalledTimes(3);

    // 最新データが取得されていることを確認
    expect(third_result.deal_history).toEqual(deal_history_third);
    expect(third_result.activity_records).toEqual(activity_records_third);
    expect(third_result.fetched_at).toBe(third_fetch_timestamp);

    // 全ての表示タイミングで新しいデータが取得されていることを確認
    expect(third_result.deal_history.length).toBeGreaterThan(second_result.deal_history.length);
    expect(third_result.activity_records.length).toBeGreaterThan(second_result.activity_records.length);

    // キャッシュレイヤーが毎回呼び出されたことを確認（キャッシュをバイパス）
    expect(mock_cache_layer).toHaveBeenCalledTimes(3);
  });
});