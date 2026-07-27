import { generateMonthlySettlementReport } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-332
  test('月次決算レポート生成機能 - 商談レコードが作成日時の降順で並んでいるとき、集計結果に順序が影響しない', () => {
    const deal_a = {
      id: 'deal_001',
      created_at: new Date('2024-01-15T10:00:00Z'),
      sales_amount: 1000000,
      status: '受注',
    };

    const deal_b = {
      id: 'deal_002',
      created_at: new Date('2024-01-10T09:30:00Z'),
      sales_amount: 1500000,
      status: '受注',
    };

    const deal_c = {
      id: 'deal_003',
      created_at: new Date('2024-01-20T14:15:00Z'),
      sales_amount: 2000000,
      status: '受注',
    };

    // 作成日時の降順で並んだ状態（C→A→B）
    const deals_in_descending_order = [deal_c, deal_a, deal_b];

    const report = generateMonthlySettlementReport({
      deals: deals_in_descending_order,
      period_start: new Date('2024-01-01T00:00:00Z'),
      period_end: new Date('2024-01-31T23:59:59Z'),
    });

    // 期待値：集計結果
    // 当月売上合計 = 450万円（100万円 + 150万円 + 200万円）
    expect(report.total_sales_amount).toBe(4500000);

    // 商談件数 = 3件
    expect(report.deal_count).toBe(3);

    // 平均売上金額 = 150万円（450万円 ÷ 3件）
    expect(report.average_sales_amount).toBe(1500000);

    // 各商談の売上金額一覧に100万円、150万円、200万円が全て含まれていること
    expect(report.sales_amounts).toContain(1000000);
    expect(report.sales_amounts).toContain(1500000);
    expect(report.sales_amounts).toContain(2000000);
    expect(report.sales_amounts.length).toBe(3);

    // レポート内の商談の表示順序に関わらず、上記の集計結果の数値が変わらないこと
    // （同じ入力で複数回実行して確認）
    const deals_in_different_order = [deal_b, deal_c, deal_a];
    const report_reordered = generateMonthlySettlementReport({
      deals: deals_in_different_order,
      period_start: new Date('2024-01-01T00:00:00Z'),
      period_end: new Date('2024-01-31T23:59:59Z'),
    });

    expect(report_reordered.total_sales_amount).toBe(4500000);
    expect(report_reordered.deal_count).toBe(3);
    expect(report_reordered.average_sales_amount).toBe(1500000);
  });
});