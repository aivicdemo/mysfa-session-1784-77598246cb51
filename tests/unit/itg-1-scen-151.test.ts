import { fetchActivityRecordsTimeSeries } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-151
  test('100件を超える履歴が存在する場合に直近100件のみが返される', async () => {
    const dealId = 'DEAL_20240115_001';
    const activityRecords = Array.from({ length: 101 }, (_, index) => {
      const timestamp = new Date(
        new Date('2024-01-15T12:00:00Z').getTime() - index * 60000
      );
      return {
        activity_id: `ACT_${String(index + 1).padStart(3, '0')}`,
        deal_id: dealId,
        activity_type: index % 3 === 0 ? 'email' : index % 3 === 1 ? 'phone' : 'visit',
        recorded_at: timestamp.toISOString(),
        description: `Activity record ${index + 1}`,
      };
    });

    const result = await fetchActivityRecordsTimeSeries({
      deal_id: dealId,
      activity_records: activityRecords,
      sort_order: 'desc',
      limit: 100,
    });

    expect(result.records).toHaveLength(100);
    expect(result.total_count).toBe(101);
    expect(result.returned_count).toBe(100);

    const firstRecord = result.records[0];
    expect(firstRecord.activity_id).toBe('ACT_001');
    expect(new Date(firstRecord.recorded_at)).toEqual(
      new Date('2024-01-15T12:00:00Z')
    );

    const lastRecord = result.records[99];
    expect(lastRecord.activity_id).toBe('ACT_100');
    expect(new Date(lastRecord.recorded_at)).toEqual(
      new Date(new Date('2024-01-15T12:00:00Z').getTime() - 99 * 60000)
    );

    for (let i = 0; i < result.records.length - 1; i++) {
      const current = new Date(result.records[i].recorded_at).getTime();
      const next = new Date(result.records[i + 1].recorded_at).getTime();
      expect(current).toBeGreaterThan(next);
    }

    expect(result.records.map((r) => r.activity_id)).not.toContain('ACT_101');
  });
});