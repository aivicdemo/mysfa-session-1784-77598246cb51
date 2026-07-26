import { determineBillingExecutionTiming } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-239
  test('月次請求スケジュール自動実行時の請求タイプ判定が正確に実行される', () => {
    // 【前提】月次請求スケジュールが複数の請求タイプで設定されている
    // 【トリガー】システムクロックが月次請求実行予定日時に到達した
    // 【期待結果】請求タイプ判定が正確に実行され、ログに記録されること

    // ■ Case 1: 定期請求（月次/毎月1日実行）- 通常の月初
    const regularBillingSchedule = {
      billing_type: 'REGULAR_MONTHLY',
      execution_day: 1,
      execution_time_utc: '09:00:00',
      timezone_offset: '+09:00',
    };
    const regularBillingTimestamp = new Date('2024-04-01T00:00:00Z'); // 月初・UTC 00:00
    const regularResult = determineBillingExecutionTiming(
      regularBillingSchedule,
      regularBillingTimestamp
    );
    // 定期請求は実行可能
    expect(regularResult.should_execute).toBe(true);
    expect(regularResult.billing_type).toBe('REGULAR_MONTHLY');
    expect(regularResult.execution_timestamp).toBe('2024-04-01T09:00:00+09:00');
    expect(regularResult.matched_records_count).toBeGreaterThanOrEqual(0);

    // ■ Case 2: 一時請求（納期後実行）- 指定納期日に達した案件
    const adhocBillingSchedule = {
      billing_type: 'ADHOC_AFTER_DELIVERY',
      trigger_field: 'delivery_date',
      execution_time_utc: '10:00:00',
      timezone_offset: '+09:00',
    };
    const adhocBillingTimestamp = new Date('2024-04-15T01:00:00Z'); // 納期日：2024-04-15 JST
    const adhocResult = determineBillingExecutionTiming(
      adhocBillingSchedule,
      adhocBillingTimestamp
    );
    // 一時請求は納期日に達したら実行可能
    expect(adhocResult.should_execute).toBe(true);
    expect(adhocResult.billing_type).toBe('ADHOC_AFTER_DELIVERY');
    expect(adhocResult.execution_timestamp).toBe('2024-04-15T10:00:00+09:00');

    // ■ Case 3: 前払い請求（予定日前実行）- 指定日より5営業日前
    const prepayBillingSchedule = {
      billing_type: 'PREPAY_ADVANCE',
      advance_days_before_due: 5,
      execution_time_utc: '08:00:00',
      timezone_offset: '+09:00',
    };
    const prepayBillingTimestamp = new Date('2024-04-10T00:00:00Z'); // 予定日 2024-04-15 の5営業日前
    const prepayResult = determineBillingExecutionTiming(
      prepayBillingSchedule,
      prepayBillingTimestamp
    );
    // 前払い請求は予定日5営業日前に実行可能
    expect(prepayResult.should_execute).toBe(true);
    expect(prepayResult.billing_type).toBe('PREPAY_ADVANCE');
    expect(prepayResult.execution_timestamp).toBe('2024-04-10T08:00:00+09:00');

    // ■ Case 4: エッジケース - 月末日（2024年4月30日）での定期請求
    const monthEndSchedule = {
      billing_type: 'REGULAR_MONTHLY',
      execution_day: 30,
      execution_time_utc: '09:00:00',
      timezone_offset: '+09:00',
    };
    const monthEndTimestamp = new Date('2024-04-30T00:00:00Z');
    const monthEndResult = determineBillingExecutionTiming(
      monthEndSchedule,
      monthEndTimestamp
    );
    expect(monthEndResult.should_execute).toBe(true);
    expect(monthEndResult.billing_type).toBe('REGULAR_MONTHLY');
    expect(monthEndResult.execution_timestamp).toBe('2024-04-30T09:00:00+09:00');

    // ■ Case 5: エッジケース - 閏年2月29日での定期請求
    const leapYearSchedule = {
      billing_type: 'REGULAR_MONTHLY',
      execution_day: 29,
      execution_time_utc: '09:00:00',
      timezone_offset: '+09:00',
    };
    const leapYearTimestamp = new Date('2024-02-29T00:00:00Z'); // 2024は閏年
    const leapYearResult = determineBillingExecutionTiming(
      leapYearSchedule,
      leapYearTimestamp
    );
    expect(leapYearResult.should_execute).toBe(true);
    expect(leapYearResult.billing_type).toBe('REGULAR_MONTHLY');
    expect(leapYearResult.execution_timestamp).toBe('2024-02-29T09:00:00+09:00');

    // ■ Case 6: エッジケース - 非閏年の2月30日指定時の日付調整（期待動作：2月28日で実行）
    const nonLeapYearSchedule = {
      billing_type: 'REGULAR_MONTHLY',
      execution_day: 30,
      execution_time_utc: '09:00:00',
      timezone_offset: '+09:00',
    };
    const nonLeapYearTimestamp = new Date('2023-02-28T00:00:00Z'); // 2023は非閏年、2月は28日まで
    const nonLeapYearResult = determineBillingExecutionTiming(
      nonLeapYearSchedule,
      nonLeapYearTimestamp
    );
    expect(nonLeapYearResult.should_execute).toBe(true);
    expect(nonLeapYearResult.execution_day_adjusted).toBe(28);

    // ■ Case 7: エッジケース - タイムゾーン境界（UTC+9:00 と UTC-8:00 の日付ズレ検証）
    const timezoneBoundarySchedule = {
      billing_type: 'REGULAR_MONTHLY',
      execution_day: 1,
      execution_time_utc: '09:00:00',
      timezone_offset: '-08:00', // 前日が実行対象
    };
    const timezoneBoundaryTimestamp = new Date('2024-04-02T16:00:00Z'); // UTC 2024-04-02 16:00 = JST 2024-04-03 01:00
    const timezoneBoundaryResult = determineBillingExecutionTiming(
      timezoneBoundarySchedule,
      timezoneBoundaryTimestamp
    );
    // 実行判定はタイムゾーンを適用して判定
    expect(timezoneBoundaryResult.local_date).toBe('2024-04-02'); // -08:00適用後の現地日時
    expect(timezoneBoundaryResult.billing_type).toBe('REGULAR_MONTHLY');

    // ■ Case 8: 複数の請求タイプが同時に判定される場合の優先順位検証
    const multipleTypesInput = [
      {
        billing_type: 'REGULAR_MONTHLY',
        execution_day: 1,
        execution_time_utc: '09:00:00',
        timezone_offset: '+09:00',
      },
      {
        billing_type: 'PREPAY_ADVANCE',
        advance_days_before_due: 0, // 本日が実行日
        execution_time_utc: '08:00:00',
        timezone_offset: '+09:00',
      },
    ];
    const multiTimestamp = new Date('2024-04-01T00:00:00Z');
    const multiResults = multipleTypesInput.map((schedule) =>
      determineBillingExecutionTiming(schedule, multiTimestamp)
    );
    // すべての請求タイプが独立して判定される
    expect(multiResults).toHaveLength(2);
    expect(multiResults[0].should_execute).toBe(true);
    expect(multiResults[1].should_execute).toBe(true);

    // ■ Case 9: 実行不要な時刻（実行予定時刻未到達）での判定
    const notYetSchedule = {
      billing_type: 'REGULAR_MONTHLY',
      execution_day: 1,
      execution_time_utc: '15:00:00', // 15:00 UTC実行予定
      timezone_offset: '+09:00',
    };
    const notYetTimestamp = new Date('2024-04-01T05:00:00Z'); // 14:00 JST（まだ15:00 UTCに達していない）
    const notYetResult = determineBillingExecutionTiming(
      notYetSchedule,
      notYetTimestamp
    );
    // 実行時刻に達していないため実行不可
    expect(notYetResult.should_execute).toBe(false);
    expect(notYetResult.reason).toMatch(/実行時刻|未到達|timing/i);

    // ■ Case 10: 請求実行ログ記録内容の検証
    const loggedSchedule = {
      billing_type: 'REGULAR_MONTHLY',
      execution_day: 1,
      execution_time_utc: '09:00:00',
      timezone_offset: '+09:00',
    };
    const loggedTimestamp = new Date('2024-04-01T00:00:00Z');
    const loggedResult = determineBillingExecutionTiming(
      loggedSchedule,
      loggedTimestamp
    );
    // ログ記録に必要な情報をすべて含む
    expect(loggedResult.log_entry).toBeDefined();
    expect(loggedResult.log_entry.timestamp).toBe('2024-04-01T09:00:00+09:00');
    expect(loggedResult.log_entry.billing_type).toBe('REGULAR_MONTHLY');
    expect(loggedResult.log_entry.execution_result).toBe('EXECUTED');
    expect(loggedResult.log_entry.target_deals_count).toBeGreaterThanOrEqual(0);

    // ■ Case 11: 請求タイプと実際の請求データが正確にマッピングされているか
    const mappingSchedule = {
      billing_type: 'REGULAR_MONTHLY',
      execution_day: 1,
      execution_time_utc: '09:00:00',
      timezone_offset: '+09:00',
    };
    const mappingTimestamp = new Date('2024-04-01T00:00:00Z');
    const mappingResult = determineBillingExecutionTiming(
      mappingSchedule,
      mappingTimestamp
    );
    // マッピング結果が包含する情報
    expect(mappingResult.billing_type).toBe('REGULAR_MONTHLY');
    expect(mappingResult.matched_records_count).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(mappingResult.matched_deal_ids)).toBe(true);
  });
});