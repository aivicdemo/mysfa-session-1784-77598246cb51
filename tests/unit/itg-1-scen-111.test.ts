import { determineExtractionPeriod } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-111
  test('抽出対象期間自動決定機能 - 月初1日が抽出対象期間の開始日として正確に設定される', () => {
    // ケース1: 現在の日付が月初1日以外（例：2024年4月15日）
    const currentDateMid = new Date('2024-04-15T10:00:00Z');
    const resultMid = determineExtractionPeriod(currentDateMid);

    // 抽出対象期間の開始日が2024年4月1日（月初1日）であることを検証
    expect(resultMid.startDate).toEqual(new Date('2024-04-01T00:00:00Z'));
    expect(resultMid.startDate.getDate()).toBe(1);

    // ケース2: 現在の日付が月初1日（例：2024年4月1日）
    const currentDateBeginning = new Date('2024-04-01T10:00:00Z');
    const resultBeginning = determineExtractionPeriod(currentDateBeginning);

    // 抽出対象期間の開始日が2024年4月1日（月初1日）のままであることを検証
    expect(resultBeginning.startDate).toEqual(new Date('2024-04-01T00:00:00Z'));
    expect(resultBeginning.startDate.getDate()).toBe(1);

    // 両ケースの開始日が同一であることを検証
    expect(resultMid.startDate.getTime()).toBe(resultBeginning.startDate.getTime());

    // 月末日での確認（例：2024年4月30日）
    const currentDateEnd = new Date('2024-04-30T23:59:59Z');
    const resultEnd = determineExtractionPeriod(currentDateEnd);

    // 抽出対象期間の開始日が2024年4月1日（月初1日）であることを検証
    expect(resultEnd.startDate).toEqual(new Date('2024-04-01T00:00:00Z'));
    expect(resultEnd.startDate.getDate()).toBe(1);

    // 終了日が当月の最終日であることを検証
    expect(resultEnd.endDate.getMonth()).toBe(resultEnd.startDate.getMonth());
    expect(resultEnd.endDate.getFullYear()).toBe(resultEnd.startDate.getFullYear());
  });
});