import { aggregateDealProgressByCustomer } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-207
  test("顧客別商談進捗集計機能 - 入力データの順序が異なるとき、集計結果は同じである", () => {
    // テストデータ: 3件の商談データ（商談ID、顧客ID、進捗ステージ、金額）
    const deal1 = {
      dealId: "DEAL001",
      customerId: "CUST001",
      stage: "提案中",
      amount: 100000,
    };
    const deal2 = {
      dealId: "DEAL002",
      customerId: "CUST001",
      stage: "交渉中",
      amount: 150000,
    };
    const deal3 = {
      dealId: "DEAL003",
      customerId: "CUST002",
      stage: "受注",
      amount: 200000,
    };

    // パターンA: [deal1, deal2, deal3]の順序
    const resultPatternA = aggregateDealProgressByCustomer([
      deal1,
      deal2,
      deal3,
    ]);

    // パターンB: [deal3, deal1, deal2]の異なる順序
    const resultPatternB = aggregateDealProgressByCustomer([
      deal3,
      deal1,
      deal2,
    ]);

    // パターンC: [deal2, deal3, deal1]のさらに異なる順序
    const resultPatternC = aggregateDealProgressByCustomer([
      deal2,
      deal3,
      deal1,
    ]);

    // パターンAとパターンBの集計結果を比較
    expect(resultPatternA).toEqual(resultPatternB);

    // パターンAとパターンCの集計結果を比較
    expect(resultPatternA).toEqual(resultPatternC);

    // 期待される集計結果の具体値を検証
    // 顧客CUST001: 提案中1件(100000円)、交渉中1件(150000円)
    // 顧客CUST002: 受注1件(200000円)
    const expectedResult = {
      CUST001: {
        stageDistribution: {
          提案中: {
            count: 1,
            totalAmount: 100000,
            averageAmount: 100000,
            distributionRate: 50,
          },
          交渉中: {
            count: 1,
            totalAmount: 150000,
            averageAmount: 150000,
            distributionRate: 50,
          },
        },
        totalDeals: 2,
        totalAmount: 250000,
        averageAmount: 125000,
      },
      CUST002: {
        stageDistribution: {
          受注: {
            count: 1,
            totalAmount: 200000,
            averageAmount: 200000,
            distributionRate: 100,
          },
        },
        totalDeals: 1,
        totalAmount: 200000,
        averageAmount: 200000,
      },
    };

    expect(resultPatternA).toEqual(expectedResult);
  });
});