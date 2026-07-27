import { fetchTimelineRecords } from '../../src/logic/it-1';

describe('顧客レコード画面の過去商談履歴・活動記録の時系列表示機能', () => {
  // SCEN-402
  test('入力データが null のとき、エラーが発生する', () => {
    expect(() => {
      fetchTimelineRecords(null);
    }).toThrow(/入力データが null です。顧客レコードIDと期間を指定してください/);
  });
});