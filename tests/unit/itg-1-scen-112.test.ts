import { determinePeriodForMonthlyReporting } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-112: [edge] 抽出対象期間自動決定機能 - 2月の抽出対象期間が28日（または29日）で正しく決定される
  test('should correctly determine extraction period end date for February in leap and non-leap years', () => {
    // 平年 (2023年) の2月のテスト
    const non_leap_year_input = {
      target_month: 2,
      system_year: 2023,
    };
    const non_leap_year_result = determinePeriodForMonthlyReporting(non_leap_year_input);
    
    expect(non_leap_year_result.period_start).toBe('2023-02-01');
    expect(non_leap_year_result.period_end).toBe('2023-02-28');
    expect(non_leap_year_result.end_date_day).toBe(28);

    // うるう年 (2024年) の2月のテスト
    const leap_year_input = {
      target_month: 2,
      system_year: 2024,
    };
    const leap_year_result = determinePeriodForMonthlyReporting(leap_year_input);
    
    expect(leap_year_result.period_start).toBe('2024-02-01');
    expect(leap_year_result.period_end).toBe('2024-02-29');
    expect(leap_year_result.end_date_day).toBe(29);

    // 別のうるう年 (2020年) の2月のテスト
    const another_leap_year_input = {
      target_month: 2,
      system_year: 2020,
    };
    const another_leap_year_result = determinePeriodForMonthlyReporting(another_leap_year_input);
    
    expect(another_leap_year_result.period_start).toBe('2020-02-01');
    expect(another_leap_year_result.period_end).toBe('2020-02-29');
    expect(another_leap_year_result.end_date_day).toBe(29);

    // 別の平年 (2022年) の2月のテスト
    const another_non_leap_year_input = {
      target_month: 2,
      system_year: 2022,
    };
    const another_non_leap_year_result = determinePeriodForMonthlyReporting(another_non_leap_year_input);
    
    expect(another_non_leap_year_result.period_start).toBe('2022-02-01');
    expect(another_non_leap_year_result.period_end).toBe('2022-02-28');
    expect(another_non_leap_year_result.end_date_day).toBe(28);
  });
});