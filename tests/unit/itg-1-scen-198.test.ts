import { validateCacheExpiry } from '../../src/logic/it-1';

describe('顧客レコード画面のキャッシュ有効期限管理', () => {
  // SCEN-198
  test('キャッシュ有効期限がnullまたはundefinedの場合にエラーが発生する', () => {
    // null値に対するエラーハンドリング
    expect(() => validateCacheExpiry(null)).toThrow(/キャッシュ有効期限/);

    // undefined値に対するエラーハンドリング
    expect(() => validateCacheExpiry(undefined)).toThrow(/キャッシュ有効期限/);
  });
});