import { extractBillingTargetData } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-242
  test("請求対象データ抽出機能 - 抽出条件に合致するデータが存在しない場合は空結果が返される", () => {
    const extractionCriteria = {
      billingPeriodStart: "2099-01-01",
      billingPeriodEnd: "2099-12-31",
      billingStatus: "未発行",
      customerSegment: "存在しない顧客ID",
    };

    const result = extractBillingTargetData(extractionCriteria);

    expect(result).toEqual({
      records: [],
      totalCount: 0,
      isDownloadEnabled: false,
      errorMessage: null,
    });
    expect(result.records.length).toBe(0);
    expect(result.totalCount).toBe(0);
    expect(result.isDownloadEnabled).toBe(false);
    expect(result.errorMessage).toBeNull();
  });
});