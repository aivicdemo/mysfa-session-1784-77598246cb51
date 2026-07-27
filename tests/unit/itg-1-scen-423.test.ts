import { filterActivityRecords } from '../../src/logic/it-1';

describe('顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能', () => {
  test('SCEN-423: 活動記録フィルタリング機能 - 入力の活動記録配列がundefinedの場合、空配列が返される', () => {
    const result = filterActivityRecords(undefined);
    expect(result).toEqual([]);
  });
});