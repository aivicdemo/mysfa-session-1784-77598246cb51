import { filterPurchaseHistoryByDuration } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  test('SCEN-184: 過去購買履歴フィルタリング機能 - 直近3年以内の購買履歴のみが抽出・表示される', () => {
    const referenceDate = new Date('2024-12-15T00:00:00Z');
    const threeYearsAgo = new Date('2021-12-15T00:00:00Z');
    const withinThreeYears1 = new Date('2024-01-10T00:00:00Z');
    const withinThreeYears2 = new Date('2023-06-20T00:00:00Z');
    const withinThreeYears3 = new Date('2022-03-15T00:00:00Z');
    const beyondThreeYears = new Date('2021-12-14T00:00:00Z');
    const farBeyond = new Date('2020-05-01T00:00:00Z');

    const purchaseHistory = [
      {
        purchase_id: 'P001',
        customer_id: 'C001',
        purchase_date: withinThreeYears1.toISOString(),
        amount: 50000,
        description: '商品A購入',
      },
      {
        purchase_id: 'P002',
        customer_id: 'C001',
        purchase_date: withinThreeYears2.toISOString(),
        amount: 30000,
        description: '商品B購入',
      },
      {
        purchase_id: 'P003',
        customer_id: 'C001',
        purchase_date: withinThreeYears3.toISOString(),
        amount: 75000,
        description: 'サービスC契約',
      },
      {
        purchase_id: 'P004',
        customer_id: 'C001',
        purchase_date: beyondThreeYears.toISOString(),
        amount: 20000,
        description: '商品D購入',
      },
      {
        purchase_id: 'P005',
        customer_id: 'C001',
        purchase_date: farBeyond.toISOString(),
        amount: 100000,
        description: '旧システム契約',
      },
    ];

    const result = filterPurchaseHistoryByDuration({
      purchase_history: purchaseHistory,
      reference_date: referenceDate.toISOString(),
      duration_years: 3,
    });

    expect(result.filtered_records.length).toBe(3);
    expect(result.excluded_count).toBe(2);
    expect(result.total_amount_within_duration).toBe(155000);

    const purchase_ids_in_result = result.filtered_records.map(
      (record) => record.purchase_id
    );
    expect(purchase_ids_in_result).toEqual(['P001', 'P002', 'P003']);
    expect(purchase_ids_in_result).not.toContain('P004');
    expect(purchase_ids_in_result).not.toContain('P005');

    const dates_in_result = result.filtered_records.map((record) =>
      new Date(record.purchase_date).getTime()
    );
    dates_in_result.forEach((purchase_time) => {
      const diff_ms = referenceDate.getTime() - purchase_time;
      const diff_days = diff_ms / (1000 * 60 * 60 * 24);
      const three_years_days = 365.25 * 3;
      expect(diff_days).toBeLessThanOrEqual(three_years_days);
    });

    expect(result.filtered_records[0].purchase_id).toBe('P001');
    expect(result.filtered_records[1].purchase_id).toBe('P002');
    expect(result.filtered_records[2].purchase_id).toBe('P003');

    expect(result.is_filtered).toBe(true);
    expect(result.filter_criteria).toEqual({
      duration_years: 3,
      reference_date: referenceDate.toISOString(),
    });
  });
});