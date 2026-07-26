import { fetchRecentDealAndActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-189
  test('商談・活動履歴の時系列表示機能 - 複数の商談と活動記録が新しい順にソートされ、直近100件までが正常に表示される', async () => {
    const mock_fetch = require('jest-fetch-mock');
    mock_fetch.enableMocks();
    mock_fetch.resetMocks();

    const customer_id = 'CUST-001';
    const mock_records = [];

    // 150件のモック記録を生成（古い順で配列に追加）
    for (let i = 1; i <= 150; i++) {
      const record_timestamp = new Date('2024-01-01T00:00:00Z');
      record_timestamp.setMinutes(record_timestamp.getMinutes() + i);

      mock_records.push({
        id: `RECORD-${String(i).padStart(3, '0')}`,
        customer_id: customer_id,
        type: i % 2 === 0 ? 'deal' : 'activity',
        title: `Record ${i}`,
        timestamp: record_timestamp.toISOString(),
        description: `Test record ${i}`,
      });
    }

    // API レスポンス: 全150件を古い順で返す
    mock_fetch.mockResponseOnce(
      JSON.stringify({
        success: true,
        data: mock_records,
        total_count: 150,
      }),
      { status: 200 }
    );

    // テスト対象関数を実行
    const result = await fetchRecentDealAndActivityRecords(customer_id);

    // アサーション: ステータス確認
    expect(result.success).toBe(true);

    // アサーション: 表示件数は100件以下
    expect(result.displayed_records.length).toBe(100);

    // アサーション: 直近100件を取得確認（151番目から150番目の100件）
    const expected_first_record_id = 'RECORD-051';
    const expected_last_record_id = 'RECORD-150';
    expect(result.displayed_records[0].id).toBe(expected_last_record_id);
    expect(result.displayed_records[99].id).toBe(expected_first_record_id);

    // アサーション: 降順（新しい順）であることを確認
    for (let i = 0; i < result.displayed_records.length - 1; i++) {
      const current_timestamp = new Date(
        result.displayed_records[i].timestamp
      ).getTime();
      const next_timestamp = new Date(
        result.displayed_records[i + 1].timestamp
      ).getTime();
      expect(current_timestamp).toBeGreaterThanOrEqual(next_timestamp);
    }

    // アサーション: 最初の記録のタイムスタンプが2番目より新しい
    const first_record_time = new Date(
      result.displayed_records[0].timestamp
    ).getTime();
    const second_record_time = new Date(
      result.displayed_records[1].timestamp
    ).getTime();
    expect(first_record_time).toBeGreaterThan(second_record_time);

    // アサーション: 最後から2番目と最後の記録を比較
    const penultimate_record_time = new Date(
      result.displayed_records[98].timestamp
    ).getTime();
    const last_record_time = new Date(
      result.displayed_records[99].timestamp
    ).getTime();
    expect(penultimate_record_time).toBeGreaterThan(last_record_time);

    // アサーション: 101件目以降の記録が表示されていない
    expect(result.displayed_records.length).toBeLessThanOrEqual(100);
    const displayed_ids = result.displayed_records.map((r) => r.id);
    expect(displayed_ids).not.toContain('RECORD-001');
    expect(displayed_ids).not.toContain('RECORD-002');
    expect(displayed_ids).not.toContain('RECORD-050');

    // アサーション: 表示された記録には51番から150番までが含まれていることを確認
    expect(displayed_ids[0]).toBe('RECORD-150');
    expect(displayed_ids[99]).toBe('RECORD-051');
  });
});