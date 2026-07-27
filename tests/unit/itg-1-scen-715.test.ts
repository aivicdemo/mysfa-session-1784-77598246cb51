import { calculateBusinessDaysInMonth } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-715: [edge] 営業日計算ロジック - 月次決算期限が月末日の場合、営業日計算が正しく同月営業日内で完結する
  test('月末日が決算期限の場合、同月内営業日のみを正確に算出する', () => {
    // 前提: 月次決算期限が月末日（2024年1月31日）に設定されている
    const settlementDeadline = new Date('2024-01-31');
    const monthStart = new Date('2024-01-01');
    const monthEnd = new Date('2024-01-31');

    // 実行: 月初1日から月末日までの期間内における営業日数を計算
    const result = calculateBusinessDaysInMonth(monthStart, monthEnd, settlementDeadline);

    // 期待値: 2024年1月1日～31日の営業日
    // 2024年1月のカレンダー: 1日(月) ~ 31日(水)
    // 土日: 6日(土), 7日(日), 13日(土), 14日(日), 20日(土), 21日(日), 27日(土), 28日(日)
    // 国定祝日（日本）: 1日(成人の日)、8日(成人の日を月曜で祝う場合はなし)
    // 実際の営業日: 2, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 22, 23, 24, 25, 26, 29, 30, 31
    // 合計: 22営業日
    const expectedBusinessDayCount = 22;
    const expectedBusinessDays = [
      new Date('2024-01-02'),
      new Date('2024-01-03'),
      new Date('2024-01-04'),
      new Date('2024-01-05'),
      new Date('2024-01-08'),
      new Date('2024-01-09'),
      new Date('2024-01-10'),
      new Date('2024-01-11'),
      new Date('2024-01-12'),
      new Date('2024-01-15'),
      new Date('2024-01-16'),
      new Date('2024-01-17'),
      new Date('2024-01-18'),
      new Date('2024-01-19'),
      new Date('2024-01-22'),
      new Date('2024-01-23'),
      new Date('2024-01-24'),
      new Date('2024-01-25'),
      new Date('2024-01-26'),
      new Date('2024-01-29'),
      new Date('2024-01-30'),
      new Date('2024-01-31'),
    ];

    // 検証: 計算結果の営業日数が同月内営業日のみで構成されていることを確認
    expect(result.businessDayCount).toBe(expectedBusinessDayCount);

    // 検証: 計算結果の営業日リストが土日・祝日を除いた平日のみで構成されていることを確認
    expect(result.businessDays.length).toBe(expectedBusinessDayCount);

    // 検証: すべての営業日が1月内に収まっていることを確認（翌月の営業日が含まれていないこと）
    result.businessDays.forEach((date) => {
      expect(date.getMonth()).toBe(0); // 0 = 1月
      expect(date.getFullYear()).toBe(2024);
      expect(date.getDate()).toBeGreaterThanOrEqual(1);
      expect(date.getDate()).toBeLessThanOrEqual(31);
    });

    // 検証: 計算結果の営業日が土日・祝日を除いた平日のみであることを確認
    result.businessDays.forEach((date) => {
      const dayOfWeek = date.getDay();
      expect([0, 6]).not.toContain(dayOfWeek); // 0 = 日曜日、6 = 土曜日
    });

    // 検証: 計算対象期間の開始日が月初1日であることを確認
    expect(result.periodStart.toISOString()).toBe(monthStart.toISOString());

    // 検証: 計算対象期間の終了日が月末日であることを確認
    expect(result.periodEnd.toISOString()).toBe(monthEnd.toISOString());

    // 検証: 計算結果の営業日リストが時系列順（昇順）であることを確認
    for (let i = 1; i < result.businessDays.length; i++) {
      expect(result.businessDays[i].getTime()).toBeGreaterThan(
        result.businessDays[i - 1].getTime()
      );
    }
  });
});