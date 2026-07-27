import { determineMonthlyExtractionPeriod } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-099
  test("月次報告期限到来時、抽出対象期間が当月1日から当月末日で自動決定される", () => {
    // 対象月を2024年1月とした報告期限日時を設定
    const reportDeadlineDateTime = new Date("2024-01-31T23:59:59Z");

    // 抽出対象期間を決定
    const extractionPeriod = determineMonthlyExtractionPeriod(
      reportDeadlineDateTime
    );

    // 期待される期間の開始: 2024年1月1日 00:00:00
    const expectedStartDate = new Date("2024-01-01T00:00:00Z");

    // 期待される期間の終了: 2024年1月31日 23:59:59
    const expectedEndDate = new Date("2024-01-31T23:59:59Z");

    // 抽出対象期間の開始日時が当月1日 00:00:00であることを確認
    expect(extractionPeriod.startDateTime).toEqual(expectedStartDate);

    // 抽出対象期間の終了日時が当月末日 23:59:59であることを確認
    expect(extractionPeriod.endDateTime).toEqual(expectedEndDate);

    // クエリパラメータが明示的に記録されていることを確認
    expect(extractionPeriod.queryStartDate).toBe("2024-01-01");
    expect(extractionPeriod.queryEndDate).toBe("2024-01-31");
  });
});