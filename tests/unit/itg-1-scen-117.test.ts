import { extractMonthlyReportData } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-117: [edge] 月次報告期限・データ抽出処理 - 抽出対象期間内に記録された活動記録0件の場合、空の活動リストが返される
  test("should return empty activity list when no activities exist within extraction period", () => {
    // 抽出対象期間を設定（2024年1月1日～2024年1月31日）
    const extraction_start_date = new Date("2024-01-01T00:00:00Z");
    const extraction_end_date = new Date("2024-01-31T23:59:59Z");

    // スタブ化されたデータストア：指定期間内に活動記録が0件の状態
    const stub_activity_records: Array<{
      activity_id: string;
      customer_id: string;
      activity_type: string;
      recorded_at: Date;
      description: string;
    }> = [];

    const stub_data_store = {
      get_activities_in_period: (start: Date, end: Date) => {
        return stub_activity_records.filter(
          (record) =>
            record.recorded_at >= start && record.recorded_at <= end
        );
      },
      get_negotiations_in_period: (start: Date, end: Date) => {
        return [];
      },
      get_issues_in_period: (start: Date, end: Date) => {
        return [];
      },
    };

    // 月次報告期限・データ抽出処理を実行
    const result = extractMonthlyReportData(
      extraction_start_date,
      extraction_end_date,
      stub_data_store
    );

    // 戻り値として返される活動リストを検証
    expect(Array.isArray(result.activities)).toBe(true);
    expect(result.activities.length).toBe(0);
  });
});