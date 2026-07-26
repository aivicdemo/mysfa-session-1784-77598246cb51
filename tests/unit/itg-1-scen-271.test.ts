import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  checkInvoicePortalReflectionDeadline,
  calculateBusinessDaysUntilReflection,
  validatePortalInvoiceVisibility,
} from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-271: [normal] 請求書ポータル反映リードタイム管理機能 - 承認済み請求書が営業日ベース1日以内にポータルに反映される
  test('SCEN-271: 承認済み請求書が営業日ベース1営業日以内にポータルに反映される', () => {
    // 前提条件: 承認済み請求書がシステムに存在
    const invoiceData = {
      invoiceId: 'INV-20240415-001',
      customerId: 'CUST-A001',
      customerName: 'テスト顧客A',
      amount: 100000,
      currency: 'JPY',
      status: 'approved',
      approvalCompletedAt: new Date('2024-04-15T14:30:00+09:00'),
    };

    // システムのタイムゾーンと営業日カレンダー設定
    const systemConfig = {
      timezone: 'Asia/Tokyo',
      businessHoursStart: 9,
      businessHoursEnd: 18,
      businessDayCalendar: [
        { date: '2024-04-15', isBusinessDay: true },
        { date: '2024-04-16', isBusinessDay: true },
        { date: '2024-04-17', isBusinessDay: true },
        { date: '2024-04-18', isBusinessDay: true },
        { date: '2024-04-19', isBusinessDay: true },
        { date: '2024-04-20', isBusinessDay: false }, // 土曜日
        { date: '2024-04-21', isBusinessDay: false }, // 日曜日
      ],
    };

    // テストケース1: 営業時間内（14:30）に承認完了 → 即座にポータル反映
    const approvalTimeBusinessHours = new Date('2024-04-15T14:30:00+09:00');
    const expectedReflectionTimeBusinessHours = new Date('2024-04-15T14:35:00+09:00'); // 5分後
    const businessHoursDaysUntilReflection = calculateBusinessDaysUntilReflection(
      approvalTimeBusinessHours,
      expectedReflectionTimeBusinessHours,
      systemConfig
    );
    expect(businessHoursDaysUntilReflection).toBe(0);

    // テストケース2: 営業時間外（18:30）に承認完了 → 翌営業日営業時間内に反映
    const approvalTimeAfterHours = new Date('2024-04-15T18:30:00+09:00');
    const expectedReflectionTimeNextDay = new Date('2024-04-16T09:15:00+09:00');
    const afterHoursDaysUntilReflection = calculateBusinessDaysUntilReflection(
      approvalTimeAfterHours,
      expectedReflectionTimeNextDay,
      systemConfig
    );
    expect(afterHoursDaysUntilReflection).toBe(1);

    // テストケース3: 金曜営業時間外（18:30）に承認完了 → 月曜営業時間内に反映
    const approvalTimeFridayAfterHours = new Date('2024-04-19T18:30:00+09:00');
    const expectedReflectionTimeMondayMorning = new Date('2024-04-22T09:15:00+09:00');
    const fridayAfterHoursDaysUntilReflection = calculateBusinessDaysUntilReflection(
      approvalTimeFridayAfterHours,
      expectedReflectionTimeMondayMorning,
      systemConfig
    );
    expect(fridayAfterHoursDaysUntilReflection).toBe(3); // 金曜→土→日→月 = 3営業日

    // ポータル可視性検証: 承認済み請求書がポータルで表示可能か確認
    const portalVisibilityResult = validatePortalInvoiceVisibility(
      invoiceData,
      expectedReflectionTimeBusinessHours,
      systemConfig
    );
    expect(portalVisibilityResult).toEqual({
      isVisible: true,
      reflectionTime: expect.any(Date),
      isWithinSLA: true,
      businessDaysElapsed: 0,
    });

    // ポータル反映期限管理: 承認完了から営業日ベース1営業日以内に反映されるか検証
    const deadlineCheckResult = checkInvoicePortalReflectionDeadline(
      invoiceData,
      systemConfig
    );
    expect(deadlineCheckResult).toEqual({
      invoiceId: 'INV-20240415-001',
      approvalStatus: 'approved',
      expectedReflectionDeadline: expect.any(Date),
      isWithinDeadline: true,
      maxBusinessDaysAllowed: 1,
    });

    // エッジケース: 正確に営業日ベース1営業日の境界値で反映
    const approvalTimeForBoundaryTest = new Date('2024-04-15T14:30:00+09:00');
    const reflectionTimeExactlyOneBusinessDay = new Date('2024-04-16T14:30:00+09:00');
    const boundaryDaysUntilReflection = calculateBusinessDaysUntilReflection(
      approvalTimeForBoundaryTest,
      reflectionTimeExactlyOneBusinessDay,
      systemConfig
    );
    expect(boundaryDaysUntilReflection).toBe(1);

    // エラーケース: 承認されていない請求書はポータルに表示されない
    const unapprovedInvoiceData = {
      invoiceId: 'INV-20240415-002',
      customerId: 'CUST-A001',
      customerName: 'テスト顧客A',
      amount: 50000,
      currency: 'JPY',
      status: 'pending',
      approvalCompletedAt: null,
    };

    expect(() => {
      validatePortalInvoiceVisibility(
        unapprovedInvoiceData,
        new Date('2024-04-15T14:30:00+09:00'),
        systemConfig
      );
    }).toThrow(/承認/);

    // エラーケース: ポータル反映期限を1営業日以上超過した場合
    const overdueReflectionTime = new Date('2024-04-17T14:30:00+09:00');
    const overdueDaysUntilReflection = calculateBusinessDaysUntilReflection(
      approvalTimeBusinessHours,
      overdueReflectionTime,
      systemConfig
    );
    expect(overdueDaysUntilReflection).toBeGreaterThan(1);

    // 統合検証: 承認完了から反映までの全プロセスが営業日ベース1営業日以内で完了
    const integrationResult = checkInvoicePortalReflectionDeadline(
      {
        invoiceId: 'INV-20240415-003',
        customerId: 'CUST-A002',
        customerName: 'テスト顧客B',
        amount: 250000,
        currency: 'JPY',
        status: 'approved',
        approvalCompletedAt: new Date('2024-04-15T09:00:00+09:00'),
      },
      systemConfig
    );
    expect(integrationResult.isWithinDeadline).toBe(true);
    expect(integrationResult.maxBusinessDaysAllowed).toBe(1);
  });
});