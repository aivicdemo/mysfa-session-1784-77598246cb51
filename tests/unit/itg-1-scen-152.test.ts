import { aggregateMonthlySalesAmount } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-152: [edge] 当月商談金額集計機能 - 明細行に0円が含まれるとき売上合計に影響しない
  test("明細行に0円が含まれる場合、売上合計は有効金額のみで正確に集計される", () => {
    const dealLineItems = [
      {
        dealLineId: "line_001",
        dealAmount: 100000,
      },
      {
        dealLineId: "line_002",
        dealAmount: 0,
      },
      {
        dealLineId: "line_003",
        dealAmount: 50000,
      },
    ];

    const result = aggregateMonthlySalesAmount(dealLineItems);

    expect(result.totalSalesAmount).toBe(150000);
    expect(result.processedLineCount).toBe(3);
  });
});