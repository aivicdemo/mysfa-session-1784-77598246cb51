import { calculateMonthlyProgressRate } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-114
  test('当月売上集計機能 - 当月の受注件数と提案数から進捗率が正確に算出される', () => {
    // Precondition: 営業管理システムに当月の全商談レコード（ステータス、金額、明細）が登録されている状態
    // Trigger: 営業担当者が月次報告期限を確認し、システムからデータ抽出を開始したとき
    // Outcome: 当月の売上合計、受注件数、進捗率（受注数÷提案数）を自動計算し、集計結果を表示

    const monthly_closed_count = 15;
    const monthly_proposal_count = 20;
    const expected_progress_rate = 75.0;

    const result = calculateMonthlyProgressRate(
      monthly_closed_count,
      monthly_proposal_count
    );

    // 進捗率が正確に算出されること: 15 ÷ 20 × 100 = 75%
    expect(result).toBe(expected_progress_rate);

    // 境界値テスト: 受注件数が0の場合は0%
    const boundary_zero_result = calculateMonthlyProgressRate(0, 10);
    expect(boundary_zero_result).toBe(0);

    // 境界値テスト: 受注件数と提案数が同じ場合は100%
    const boundary_full_result = calculateMonthlyProgressRate(10, 10);
    expect(boundary_full_result).toBe(100);

    // 小数点第2位までの精度で正確に計算されることを確認
    // 例: 1 ÷ 3 × 100 = 33.33...
    const decimal_result = calculateMonthlyProgressRate(1, 3);
    expect(decimal_result).toBe(33.33);

    // 端数処理が適切に行われていることを確認
    // 例: 2 ÷ 3 × 100 = 66.66...
    const rounding_result = calculateMonthlyProgressRate(2, 3);
    expect(rounding_result).toBe(66.67);

    // エラーテスト: 提案数が0の場合は例外をスロー
    expect(() => {
      calculateMonthlyProgressRate(5, 0);
    }).toThrow(/提案数/);

    // エラーテスト: 受注件数が負数の場合は例外をスロー
    expect(() => {
      calculateMonthlyProgressRate(-1, 10);
    }).toThrow(/受注件数/);

    // エラーテスト: 提案数が負数の場合は例外をスロー
    expect(() => {
      calculateMonthlyProgressRate(10, -1);
    }).toThrow(/提案数/);

    // エラーテスト: 受注件数が提案数より多い場合は例外をスロー
    expect(() => {
      calculateMonthlyProgressRate(25, 20);
    }).toThrow(/受注件数/);
  });
});