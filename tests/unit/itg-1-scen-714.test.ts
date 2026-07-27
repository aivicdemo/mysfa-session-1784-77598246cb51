import { calculateBusinessDayOffset } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-714
  test('月次決算期限が月初1日の場合、営業日逆算計算が正しく前月営業日をまたぐ', () => {
    // Arrange: テスト用営業日マスタデータを準備
    // 前月（1月）の営業日を複数件登録
    const businessDaysMaster = [
      { date: new Date('2024-01-23T00:00:00Z'), isBusinessDay: true },
      { date: new Date('2024-01-24T00:00:00Z'), isBusinessDay: true },
      { date: new Date('2024-01-25T00:00:00Z'), isBusinessDay: true },
      { date: new Date('2024-01-26T00:00:00Z'), isBusinessDay: true },
      { date: new Date('2024-01-29T00:00:00Z'), isBusinessDay: true },
      { date: new Date('2024-01-30T00:00:00Z'), isBusinessDay: true },
      // 当月（2月）1日を非営業日として設定
      { date: new Date('2024-02-01T00:00:00Z'), isBusinessDay: false },
      { date: new Date('2024-02-02T00:00:00Z'), isBusinessDay: true },
    ];

    // 月次決算期限を当月1日に設定
    const monthlySettlementDeadline = new Date('2024-02-01T00:00:00Z');
    const offsetBusinessDays = -5; // 5営業日前を逆算

    // Act: 営業日を逆算して5営業日前の日付を計算
    const result = calculateBusinessDayOffset(
      monthlySettlementDeadline,
      offsetBusinessDays,
      businessDaysMaster
    );

    // Assert: 計算された逆算営業日が期待値と一致することを検証
    // 1月30日が最終営業日の場合、5営業日前は1月23日となる
    const expectedDate = new Date('2024-01-23T00:00:00Z');
    expect(result).toEqual(expectedDate);
  });
});