import { getDueDateDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求データの紐付け・可視化 - 年度またぎケース', () => {
  test('SCEN-296: 売上計上予定日が年度をまたぐとき、期日ズレの判定が正常に実行される', () => {
    // Arrange: テスト日時を2024年3月10日に固定
    const mockCurrentDate = new Date('2024-03-10T00:00:00Z');
    const originalDateNow = Date.now;
    Date.now = jest.fn(() => mockCurrentDate.getTime());

    try {
      // 商談レコード
      const dealRecord = {
        dealId: 'DEAL-20240001',
        dealName: '年度またぎ商談',
        revenueRecognitionDate: new Date('2024-04-15T00:00:00Z'),
        status: 'COMPLETED'
      };

      // 請求データレコード
      const invoiceRecord = {
        invoiceId: 'INV-20240001',
        invoicePlannedDate: new Date('2024-03-31T00:00:00Z'),
        amount: 100000,
        invoiceStatus: 'UNPAID'
      };

      // Act: 期日ズレ判定ロジックを呼び出し
      const result = getDueDateDiscrepancy(dealRecord, invoiceRecord);

      // Assert: 戻り値を検証
      // 日数差分: 2024-04-15 - 2024-03-31 = 15日
      expect(result.discrepancyDays).toBe(15);
      
      // 年度境界をまたぐ: true (3月31日から4月15日は会計年度の変わり目を通る)
      expect(result.isAcrossYearBoundary).toBe(true);
      
      // 期日ズレタイプ: ADVANCE (売上計上予定日が請求予定日より後 = 期日前払い)
      expect(result.discrepancyType).toBe('ADVANCE');
      
      // 判定結果: VALID (年度境界をまたいでも日付比較が正常に実行され、ズレが妥当と判定される)
      expect(result.judgement).toBe('VALID');
    } finally {
      // Cleanup: Date.now を元に戻す
      Date.now = originalDateNow;
    }
  });
});