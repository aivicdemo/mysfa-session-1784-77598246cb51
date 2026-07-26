import { checkMonthlyReportingDeadline } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-042
  test('[normal] 月次報告期限チェック機能 - 現在日時が月次報告期限前の場合、期限未到達と判定される', () => {
    // Arrange: テスト環境の現在日時を月次報告期限の3日前に設定
    const currentDateTime = new Date('2024-01-12T09:00:00Z');
    const monthlyReportingDeadline = new Date('2024-01-15T17:00:00Z');

    // Act: 月次報告期限チェック機能を呼び出す
    const result = checkMonthlyReportingDeadline({
      currentDateTime,
      monthlyReportingDeadline,
    });

    // Assert: 判定結果が「期限未到達」であることを確認
    expect(result).toEqual({
      isDeadlineReached: false,
      status: '期限未到達',
      daysUntilDeadline: 3,
    });
  });
});