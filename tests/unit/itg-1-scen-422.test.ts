import { filterActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  // SCEN-422
  test('活動記録フィルタリング機能 - 入力の活動記録配列がnullの場合、空配列が返される', () => {
    const result = filterActivityRecords(null);
    
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
    expect(result).toEqual([]);
  });
});