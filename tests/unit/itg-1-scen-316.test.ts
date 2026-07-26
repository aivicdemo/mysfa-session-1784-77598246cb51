import { calculateTotalCost } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-316
  test("ライセンス費用・運用コスト比較機能 - 3要素から総コストが正確に積算される", () => {
    // パターン1: 基本的な計算
    // Salesforceライセンス費用 = 月額費用 × ユーザー数 = 10,000 × 10 = 100,000
    // 初期構築コスト = 500,000
    // 年間保守運用コスト = 200,000
    // 期待総コスト = 100,000 + 500,000 + 200,000 = 800,000
    const result1 = calculateTotalCost({
      salesforceMonthlyFee: 10000,
      userCount: 10,
      initialConstructionCost: 500000,
      annualMaintenanceCost: 200000,
    });
    expect(result1).toBe(800000);

    // パターン2: 異なる値での計算
    // Salesforceライセンス費用 = 月額費用 × ユーザー数 = 15,000 × 20 = 300,000
    // 初期構築コスト = 1,200,000
    // 年間保守運用コスト = 350,000
    // 期待総コスト = 300,000 + 1,200,000 + 350,000 = 1,850,000
    const result2 = calculateTotalCost({
      salesforceMonthlyFee: 15000,
      userCount: 20,
      initialConstructionCost: 1200000,
      annualMaintenanceCost: 350000,
    });
    expect(result2).toBe(1850000);

    // パターン3: 最小値での計算
    // Salesforceライセンス費用 = 月額費用 × ユーザー数 = 5,000 × 5 = 25,000
    // 初期構築コスト = 100,000
    // 年間保守運用コスト = 50,000
    // 期待総コスト = 25,000 + 100,000 + 50,000 = 175,000
    const result3 = calculateTotalCost({
      salesforceMonthlyFee: 5000,
      userCount: 5,
      initialConstructionCost: 100000,
      annualMaintenanceCost: 50000,
    });
    expect(result3).toBe(175000);

    // パターン4: 大規模な値での計算
    // Salesforceライセンス費用 = 月額費用 × ユーザー数 = 20,000 × 100 = 2,000,000
    // 初期構築コスト = 5,000,000
    // 年間保守運用コスト = 1,500,000
    // 期待総コスト = 2,000,000 + 5,000,000 + 1,500,000 = 8,500,000
    const result4 = calculateTotalCost({
      salesforceMonthlyFee: 20000,
      userCount: 100,
      initialConstructionCost: 5000000,
      annualMaintenanceCost: 1500000,
    });
    expect(result4).toBe(8500000);
  });
});