import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { extractMonthlyReportData } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-102: [edge] 月次報告期限・データ抽出処理 - 2月の抽出対象期間が2月1日から2月末日で自動決定される（28日の年）
  test("should auto-determine extraction period from 2024-02-01 to 2024-02-28 for February in leap year mock", () => {
    // Arrange
    const fixed_current_date = new Date("2024-02-15T10:00:00Z");
    const mock_get_current_date = jest.fn(() => fixed_current_date);

    const extraction_request = {
      user_id: "user_001",
      report_period: "2024-02",
      get_current_date: mock_get_current_date,
    };

    // Act
    const extraction_result = extractMonthlyReportData(extraction_request);

    // Assert
    expect(extraction_result.period_start_date).toBe("2024-02-01");
    expect(extraction_result.period_end_date).toBe("2024-02-28");
    expect(extraction_result.extraction_triggered).toBe(true);
    expect(mock_get_current_date).toHaveBeenCalled();
  });
});