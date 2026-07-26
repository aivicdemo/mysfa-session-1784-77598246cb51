import { calculateDeploymentReadiness } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-302
  test("研修実施率がゼロの場合、計算処理がエラーまたは警告を発生させる", () => {
    const trainingExecutionRate = 0;
    const manualComprehensionRate = 85;
    const systemOperationProficiency = 90;

    expect(() => {
      calculateDeploymentReadiness({
        trainingExecutionRate,
        manualComprehensionRate,
        systemOperationProficiency,
      });
    }).toThrow(/研修実施率/);
  });
});