import { CacheManager } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-199: [edge] キャッシュ有効期限管理機能 - キャッシュ有効期限の境界時刻（ちょうど期限切れの瞬間）で正確に判定される
  test('キャッシュ有効期限がちょうど切れた瞬間に isExpired() が true を返し、取得が失敗する', () => {
    const cacheManager = new CacheManager();
    const cacheKey = 'sales_data_001';
    const cacheValue = 'test_value';
    const expirationDurationMs = 60000; // 60秒

    // 基準時刻を固定
    const baseTime = new Date('2024-01-15T11:00:00.000Z');
    const expirationTime = new Date(baseTime.getTime() + expirationDurationMs);
    const expiredCheckTime = new Date(expirationTime.getTime()); // ちょうど期限切れの瞬間

    // キャッシュに登録
    cacheManager.setCurrentTime(baseTime);
    cacheManager.set(cacheKey, cacheValue, expirationDurationMs);

    // ちょうど有効期限切れの瞬間で判定
    cacheManager.setCurrentTime(expiredCheckTime);
    const isExpiredResult = cacheManager.isExpired(cacheKey);
    const getCacheResult = cacheManager.get(cacheKey);

    // 期限切れ判定が true
    expect(isExpiredResult).toBe(true);
    // キャッシュ取得結果が null または undefined
    expect(getCacheResult).toBeNull();
  });
});