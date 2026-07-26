import { generateLicenseCostComparisonTable } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能 - ライセンス費用・運用コスト比較", () => {
  // SCEN-317
  test("複数年度にわたるライセンス費用と運用コストを累計して比較表が生成される", () => {
    // Arrange: 複数年度のライセンス費用と運用コストデータ
    const comparisonInput = {
      fiscalYears: [
        {
          year: 2023,
          annualLicenseCost: 1200000,
          annualOperationCost: 450000,
        },
        {
          year: 2024,
          annualLicenseCost: 1200000,
          annualOperationCost: 480000,
        },
        {
          year: 2025,
          annualLicenseCost: 1200000,
          annualOperationCost: 510000,
        },
      ],
    };

    // Act: 比較表を生成
    const result = generateLicenseCostComparisonTable(comparisonInput);

    // Assert: 比較表の構造と値が正しいことを検証
    expect(result).toEqual({
      comparisonTable: [
        {
          year: 2023,
          annualLicenseCost: 1200000,
          annualOperationCost: 450000,
          yearlyTotalCost: 1650000,
          cumulativeLicenseCost: 1200000,
          cumulativeOperationCost: 450000,
          cumulativeTotalCost: 1650000,
        },
        {
          year: 2024,
          annualLicenseCost: 1200000,
          annualOperationCost: 480000,
          yearlyTotalCost: 1680000,
          cumulativeLicenseCost: 2400000,
          cumulativeOperationCost: 930000,
          cumulativeTotalCost: 3330000,
        },
        {
          year: 2025,
          annualLicenseCost: 1200000,
          annualOperationCost: 510000,
          yearlyTotalCost: 1710000,
          cumulativeLicenseCost: 3600000,
          cumulativeOperationCost: 1440000,
          cumulativeTotalCost: 5040000,
        },
      ],
      grandTotalLicenseCost: 3600000,
      grandTotalOperationCost: 1440000,
      grandTotalCost: 5040000,
      averageAnnualCost: 1680000,
    });

    // Assert: 各年度の年度別累計が正しく計算されていることを確認
    expect(result.comparisonTable[0].yearlyTotalCost).toBe(1650000);
    expect(result.comparisonTable[1].yearlyTotalCost).toBe(1680000);
    expect(result.comparisonTable[2].yearlyTotalCost).toBe(1710000);

    // Assert: 各年度の累計ライセンス費用が正しく計算されていることを確認
    expect(result.comparisonTable[0].cumulativeLicenseCost).toBe(1200000);
    expect(result.comparisonTable[1].cumulativeLicenseCost).toBe(2400000);
    expect(result.comparisonTable[2].cumulativeLicenseCost).toBe(3600000);

    // Assert: 各年度の累計運用コストが正しく計算されていることを確認
    expect(result.comparisonTable[0].cumulativeOperationCost).toBe(450000);
    expect(result.comparisonTable[1].cumulativeOperationCost).toBe(930000);
    expect(result.comparisonTable[2].cumulativeOperationCost).toBe(1440000);

    // Assert: 総累計費用（ライセンス費用＋運用コスト）が正しく表示されていることを確認
    expect(result.comparisonTable[0].cumulativeTotalCost).toBe(1650000);
    expect(result.comparisonTable[1].cumulativeTotalCost).toBe(3330000);
    expect(result.comparisonTable[2].cumulativeTotalCost).toBe(5040000);

    // Assert: 総合計値が正しく計算されていることを確認
    expect(result.grandTotalLicenseCost).toBe(3600000);
    expect(result.grandTotalOperationCost).toBe(1440000);
    expect(result.grandTotalCost).toBe(5040000);
    expect(result.averageAnnualCost).toBe(1680000);
  });
});