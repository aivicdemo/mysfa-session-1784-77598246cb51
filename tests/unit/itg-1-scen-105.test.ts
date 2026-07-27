import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { extractCustomersByPeriod } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録表示機能', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-105
  test('月次報告期限・データ抽出処理 - 抽出対象期間内に作成された顧客レコード0件の場合、空の顧客リストが返される', () => {
    // 抽出対象期間を指定（2024年1月1日〜2024年1月31日）
    const extractStartDate = new Date('2024-01-01T00:00:00Z');
    const extractEndDate = new Date('2024-01-31T23:59:59Z');

    // 抽出対象期間内に作成された顧客レコードが0件の状態
    const mockDatabaseQuery = jest.fn().mockReturnValue([]);

    // データ抽出処理を実行
    const result = extractCustomersByPeriod(
      extractStartDate,
      extractEndDate,
      mockDatabaseQuery
    );

    // 期待結果の検証
    // 1. 戻り値が空配列 [] であること
    expect(result).toEqual([]);

    // 2. 顧客リストのレコード数がゼロであること
    expect(result.length).toBe(0);

    // 3. 戻り値のデータ型が配列（array）であること
    expect(Array.isArray(result)).toBe(true);

    // 4. 関数が期待通りに呼ばれたことを確認（エラーが発生せず正常に完了）
    expect(mockDatabaseQuery).toHaveBeenCalledWith({
      startDate: extractStartDate,
      endDate: extractEndDate,
    });
    expect(mockDatabaseQuery).toHaveBeenCalledTimes(1);
  });
});