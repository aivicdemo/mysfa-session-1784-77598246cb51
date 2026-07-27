import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  test('SCEN-317: 月次決算レポート生成機能 - 対象期間の開始日の前日23:59:59時点のレコードは集計対象から除外される', () => {
    // 対象期間: 2024年1月1日 00:00:00～2024年1月31日 23:59:59
    const period_start = new Date('2024-01-01T00:00:00Z');
    const period_end = new Date('2024-01-31T23:59:59Z');

    // テスト対象レコード
    const records = [
      // 対象期間の開始日の前日23:59:59に作成 → 除外対象
      {
        id: 'record_001',
        created_at: new Date('2023-12-31T23:59:59Z'),
        sales_amount: 10000
      },
      // 対象期間の開始日00:00:00に作成 → 集計対象
      {
        id: 'record_002',
        created_at: new Date('2024-01-01T00:00:00Z'),
        sales_amount: 20000
      },
      // 対象期間の終了日23:59:59に作成 → 集計対象
      {
        id: 'record_003',
        created_at: new Date('2024-01-31T23:59:59Z'),
        sales_amount: 30000
      }
    ];

    // 月次決算レポート生成関数を呼び出し
    const report = generateMonthlySettlementReport({
      records: records,
      period_start: period_start,
      period_end: period_end
    });

    // 期待結果の検証
    // 集計対象: record_002 (20,000円) + record_003 (30,000円) = 50,000円
    expect(report.total_sales_amount).toBe(50000);
    expect(report.included_record_count).toBe(2);
    expect(report.included_records).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'record_002', sales_amount: 20000 }),
        expect.objectContaining({ id: 'record_003', sales_amount: 30000 })
      ])
    );
    // record_001 は集計対象から除外されていることを確認
    expect(report.included_records).not.toContainEqual(
      expect.objectContaining({ id: 'record_001' })
    );
  });
});