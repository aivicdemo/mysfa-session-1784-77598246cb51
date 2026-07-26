import { detectBillingDelay } from '../../src/logic/it-1784969823049-2-1-3';

describe('顧客ポータルのアクセス制御と権限管理', () => {
  // SCEN-059
  test('[normal] ステータス・請求ズレ検出機能 - 請求書発行が商談ステータス更新から30日以上遅延している場合、遅延警告が発生する', () => {
    // 商談ステータス更新日時を記録
    const dealStatusUpdatedAt = new Date('2024-01-01T10:00:00Z');

    // システム日時を商談ステータス更新から30日後に進める
    const billingIssuedAt = new Date('2024-01-31T10:00:00Z');

    // 遅延日数を計算: 31日 - 1日 = 30日（ちょうど境界値）
    const delayDays = Math.floor(
      (billingIssuedAt.getTime() - dealStatusUpdatedAt.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    // 商談ID
    const dealId = 'DEAL-20240101-001';

    // 請求書発行が30日以上遅延しているケース
    const result = detectBillingDelay({
      dealId,
      dealStatusUpdatedAt,
      billingIssuedAt,
    });

    // 遅延警告が発生することを確認
    expect(result.hasDelay).toBe(true);
    expect(result.delayDays).toBe(30);
    expect(result.dealId).toBe('DEAL-20240101-001');
    expect(result.warningMessage).toMatch(/請求書発行が遅延/);
    expect(result.warningMessage).toContain('DEAL-20240101-001');
    expect(result.warningMessage).toContain('30');

    // 31日以上遅延のケース
    const billingIssuedAtLongDelay = new Date('2024-02-01T10:00:00Z');
    const resultLongDelay = detectBillingDelay({
      dealId: 'DEAL-20240101-002',
      dealStatusUpdatedAt,
      billingIssuedAt: billingIssuedAtLongDelay,
    });

    expect(resultLongDelay.hasDelay).toBe(true);
    expect(resultLongDelay.delayDays).toBe(31);
    expect(resultLongDelay.dealId).toBe('DEAL-20240101-002');
    expect(resultLongDelay.warningMessage).toMatch(/請求書発行が遅延/);

    // 遅延していないケース（29日）
    const billingIssuedAtOnTime = new Date('2024-01-30T10:00:00Z');
    const resultOnTime = detectBillingDelay({
      dealId: 'DEAL-20240101-003',
      dealStatusUpdatedAt,
      billingIssuedAt: billingIssuedAtOnTime,
    });

    expect(resultOnTime.hasDelay).toBe(false);
    expect(resultOnTime.delayDays).toBe(29);
    expect(resultOnTime.dealId).toBe('DEAL-20240101-003');
    expect(resultOnTime.warningMessage).toBe('');

    // 同日発行のケース
    const billingIssuedAtSameDay = new Date('2024-01-01T15:00:00Z');
    const resultSameDay = detectBillingDelay({
      dealId: 'DEAL-20240101-004',
      dealStatusUpdatedAt,
      billingIssuedAt: billingIssuedAtSameDay,
    });

    expect(resultSameDay.hasDelay).toBe(false);
    expect(resultSameDay.delayDays).toBe(0);
    expect(resultSameDay.dealId).toBe('DEAL-20240101-004');
    expect(resultSameDay.warningMessage).toBe('');

    // 商談ステータス更新日時が不正な場合のエラーハンドリング
    expect(() =>
      detectBillingDelay({
        dealId: 'DEAL-20240101-005',
        dealStatusUpdatedAt: null as any,
        billingIssuedAt,
      })
    ).toThrow(/商談ステータス更新日時/);

    // 請求書発行日時が不正な場合のエラーハンドリング
    expect(() =>
      detectBillingDelay({
        dealId: 'DEAL-20240101-006',
        dealStatusUpdatedAt,
        billingIssuedAt: null as any,
      })
    ).toThrow(/請求書発行日時/);

    // 請求書発行日時が商談ステータス更新日時より前の場合のエラー
    expect(() =>
      detectBillingDelay({
        dealId: 'DEAL-20240101-007',
        dealStatusUpdatedAt: new Date('2024-02-01T10:00:00Z'),
        billingIssuedAt: new Date('2024-01-01T10:00:00Z'),
      })
    ).toThrow(/日時順序/);
  });
});