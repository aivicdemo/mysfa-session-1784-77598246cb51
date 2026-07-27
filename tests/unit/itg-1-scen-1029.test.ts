import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import type { NotificationServiceAdapter } from '../../src/adapters/NotificationServiceAdapter';
import { updateNotificationStatusOnDashboard } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  let notificationServiceAdapterStub: NotificationServiceAdapter;
  let dashboardCache: { lastValidStatus: string; errorLog: string[] };

  beforeEach(() => {
    dashboardCache = {
      lastValidStatus: '正常配信済み',
      errorLog: [],
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-1029
  test('Gmail連携 - メール送信が予期しない応答形式を返した場合、不正な通知ステータスがダッシュボードに反映されない', async () => {
    // 期待しない応答形式をモック（フィールド構造が不正）
    const malformedResponse = {
      unexpectedField: 'invalid_structure',
      // 期待される deliveryStatus フィールドが欠落
    };

    notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn().mockResolvedValue(malformedResponse),
    };

    // 見積書発行後に配信ステータス取得を試みるシナリオを実行
    const quoteId = 'QUOTE-001';
    const invoiceId = 'INV-001';

    const result = await updateNotificationStatusOnDashboard(
      invoiceId,
      quoteId,
      notificationServiceAdapterStub,
      dashboardCache
    );

    // ダッシュボードに不正なステータスが反映されていないことを確認
    expect(result.displayedStatus).not.toBe(null);
    expect(result.displayedStatus).not.toBe(undefined);
    expect(result.displayedStatus).toBe('正常配信済み');

    // エラーログに応答形式の不正を示す記録が残っていることを確認
    expect(dashboardCache.errorLog.length).toBeGreaterThan(0);
    expect(dashboardCache.errorLog[0]).toMatch(/配信ステータス取得失敗|応答形式が不正/);

    // 配信ステータスキャッシュ値（前回の正常値）が使用されることを確認
    expect(result.usedCache).toBe(true);
  });
});