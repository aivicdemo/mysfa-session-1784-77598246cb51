import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { calculateInvoicePortalReflectionLeadtime } from '../../src/logic/it-1-3';

const fetchMock = require('jest-fetch-mock');

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  // SCEN-274
  test('請求書ポータル反映リードタイム管理機能 - 祝日を挟む場合、営業日ベースで1日以内にポータル反映が完了する', async () => {
    // 前提: 営業管理システムに請求書データが存在し、祝日マスタが設定されている状態
    // 発生条件: 営業管理者が請求書ポータル反映リードタイム管理機能にアクセスし、祝日を挟む日付での反映検証を実行する

    const testInvoiceId = 'INV-2024-001';
    const createdAt = new Date('2024-05-24T09:00:00Z'); // 金曜日
    const nextDay = new Date('2024-05-25T09:00:00Z'); // 土曜日（祝日として設定）
    const businessDayAfterHoliday = new Date('2024-05-26T09:00:00Z'); // 日曜日
    const nextBusinessDay = new Date('2024-05-27T09:00:00Z'); // 月曜日（営業日）

    const holidays = [
      '2024-05-25', // 祝日
    ];

    const invoiceData = {
      invoiceId: testInvoiceId,
      customerId: 'CUST-001',
      amount: 150000,
      invoiceDate: '2024-05-24',
      dueDate: '2024-06-24',
      status: 'approved',
      createdAt: createdAt.toISOString(),
    };

    // 請求書承認APIをモック
    fetchMock.mockResponseOnce(
      JSON.stringify({
        success: true,
        invoiceId: testInvoiceId,
        approvalTime: createdAt.toISOString(),
        status: 'approved',
      }),
      { status: 200 }
    );

    // ポータル反映状態確認APIをモック（営業日の1日以内に反映完了）
    fetchMock.mockResponseOnce(
      JSON.stringify({
        invoiceId: testInvoiceId,
        portalReflectionTime: nextBusinessDay.toISOString(),
        reflectionStatus: 'completed',
        businessDayCount: 1,
        elapsedCalendarDays: 3,
        holidayCount: 1,
        holidays: holidays,
      }),
      { status: 200 }
    );

    // 関数を呼び出し、結果を取得
    const result = await calculateInvoicePortalReflectionLeadtime({
      invoiceId: testInvoiceId,
      invoiceData: invoiceData,
      approvalTime: createdAt,
      holidays: holidays,
      businessDayThreshold: 1,
    });

    // 結果の検証
    expect(result).toBeDefined();
    expect(result.invoiceId).toBe(testInvoiceId);
    expect(result.businessDayCount).toBe(1);
    expect(result.isWithinThreshold).toBe(true);
    expect(result.holidayCount).toBe(1);
    expect(result.elapsedCalendarDays).toBe(3);

    // ポータルに請求書が完全に反映されたことを検証
    expect(result.reflectionStatus).toBe('completed');
    expect(result.portalReflectionTime).toBe(nextBusinessDay.toISOString());

    // 祝日を正しく除外していることを検証
    expect(result.holidays).toContain('2024-05-25');
    expect(result.holidays.length).toBe(1);

    // リードタイムカウントが営業日ベースであることを検証
    // 5/24（金）→ 5/25（祝日）→ 5/26（日）→ 5/27（月：営業日）
    // 営業日ベースでは：5/24 + 1営業日 = 5/27で完了
    expect(result.businessDayCount).toBeLessThanOrEqual(1);

    // 2つのAPI呼び出しが行われたことを検証
    expect(fetchMock.mock.calls.length).toBe(2);

    // 反映完了までの実経過時間と営業日ベースの経過日数を確認
    const expectedDaysForReflection = 1; // 営業日ベース1日以内
    expect(result.businessDayCount).toBeLessThanOrEqual(expectedDaysForReflection);

    // 境界値テスト：営業日ベースでちょうど1日で反映完了した場合
    expect(result.businessDayCount).toBe(1);
    expect(result.isWithinThreshold).toBe(true);

    // エラーテスト：無効な祝日マスタデータ
    expect(() =>
      calculateInvoicePortalReflectionLeadtime({
        invoiceId: testInvoiceId,
        invoiceData: invoiceData,
        approvalTime: createdAt,
        holidays: null as any,
        businessDayThreshold: 1,
      })
    ).toThrow(/祝日/);

    // エラーテスト：営業日閾値が0以下
    expect(() =>
      calculateInvoicePortalReflectionLeadtime({
        invoiceId: testInvoiceId,
        invoiceData: invoiceData,
        approvalTime: createdAt,
        holidays: holidays,
        businessDayThreshold: 0,
      })
    ).toThrow(/閾値/);

    // エラーテスト：承認時刻が無効
    expect(() =>
      calculateInvoicePortalReflectionLeadtime({
        invoiceId: testInvoiceId,
        invoiceData: invoiceData,
        approvalTime: null as any,
        holidays: holidays,
        businessDayThreshold: 1,
      })
    ).toThrow(/承認時刻/);
  });
});