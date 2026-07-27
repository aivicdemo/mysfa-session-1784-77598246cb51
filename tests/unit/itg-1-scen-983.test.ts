import { determineMigrationCompletion } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  test("SCEN-983: 移行完了判定機能 - 不整合件数が許容閾値より1件少ない場合、移行完了と判定される", () => {
    const tolerance_threshold = 5;
    const discrepancy_count = 4;

    const result = determineMigrationCompletion({
      toleranceThreshold: tolerance_threshold,
      discrepancyCount: discrepancy_count,
    });

    expect(result.isCompleted).toBe(true);
    expect(result.migrationStatus).toBe("completed");
    expect(result.hasWarnings).toBe(false);
    expect(result.discrepancyCount).toBe(4);
  });
});