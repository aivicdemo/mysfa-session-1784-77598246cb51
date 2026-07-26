import { calculateThreeYearTotalCost, calculateROI, comparePlans } from '../../src/logic/common';

describe('費用比較表・ROI算出機能', () => {
  // SCEN-285
  test('[normal] 3年間の総コストと3年間のROIが比較表に正確に反映される', () => {
    // プラン A: 初期費用 100,000円、月額 50,000円、その他コスト 0円
    const planA = {
      name: 'Plan A',
      initialCost: 100000,
      monthlyCost: 50000,
      otherCost: 0,
      annualRevenue: 500000,
    };

    // プラン B: 初期費用 200,000円、月額 30,000円、その他コスト 50,000円
    const planB = {
      name: 'Plan B',
      initialCost: 200000,
      monthlyCost: 30000,
      otherCost: 50000,
      annualRevenue: 800000,
    };

    // プラン C: 初期費用 50,000円、月額 60,000円、その他コスト 100,000円
    const planC = {
      name: 'Plan C',
      initialCost: 50000,
      monthlyCost: 60000,
      otherCost: 100000,
      annualRevenue: 600000,
    };

    const plans = [planA, planB, planC];
    const threeYearMonths = 36;

    // 期待値計算:
    // プラン A: 100,000 + (50,000 × 36) + 0 = 100,000 + 1,800,000 = 1,900,000
    const expectedCostA = 1900000;
    // プラン B: 200,000 + (30,000 × 36) + 50,000 = 200,000 + 1,080,000 + 50,000 = 1,330,000
    const expectedCostB = 1330000;
    // プラン C: 50,000 + (60,000 × 36) + 100,000 = 50,000 + 2,160,000 + 100,000 = 2,310,000
    const expectedCostC = 2310000;

    // 3年間の総収益 = 年間収益 × 3
    // プラン A: 500,000 × 3 = 1,500,000
    const expectedRevenueA = 1500000;
    // プラン B: 800,000 × 3 = 2,400,000
    const expectedRevenueB = 2400000;
    // プラン C: 600,000 × 3 = 1,800,000
    const expectedRevenueC = 1800000;

    // ROI = (総収益 - 総コスト) / 総コスト × 100
    // プラン A: (1,500,000 - 1,900,000) / 1,900,000 × 100 = -21.05%
    const expectedROIA = -21.052631578947366;
    // プラン B: (2,400,000 - 1,330,000) / 1,330,000 × 100 = 80.60%
    const expectedROIB = 80.60150375939849;
    // プラン C: (1,800,000 - 2,310,000) / 2,310,000 × 100 = -22.08%
    const expectedROIC = -22.077922077922078;

    // 3年間の総コスト計算
    const actualCostA = calculateThreeYearTotalCost(planA.initialCost, planA.monthlyCost, planA.otherCost, threeYearMonths);
    const actualCostB = calculateThreeYearTotalCost(planB.initialCost, planB.monthlyCost, planB.otherCost, threeYearMonths);
    const actualCostC = calculateThreeYearTotalCost(planC.initialCost, planC.monthlyCost, planC.otherCost, threeYearMonths);

    // ROI計算
    const actualROIA = calculateROI(expectedRevenueA, actualCostA);
    const actualROIB = calculateROI(expectedRevenueB, actualCostB);
    const actualROIC = calculateROI(expectedRevenueC, actualCostC);

    // 比較表の生成
    const comparisonTable = comparePlans(plans, threeYearMonths);

    // 総コストの検証
    expect(actualCostA).toBe(expectedCostA);
    expect(actualCostB).toBe(expectedCostB);
    expect(actualCostC).toBe(expectedCostC);

    // ROIの検証
    expect(actualROIA).toBeCloseTo(expectedROIA, 2);
    expect(actualROIB).toBeCloseTo(expectedROIB, 2);
    expect(actualROIC).toBeCloseTo(expectedROIC, 2);

    // 比較表のデータ構造検証
    expect(comparisonTable).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Plan A',
          totalCost: expectedCostA,
          roi: expect.closeTo(expectedROIA, 2),
        }),
        expect.objectContaining({
          name: 'Plan B',
          totalCost: expectedCostB,
          roi: expect.closeTo(expectedROIB, 2),
        }),
        expect.objectContaining({
          name: 'Plan C',
          totalCost: expectedCostC,
          roi: expect.closeTo(expectedROIC, 2),
        }),
      ])
    );

    // 総コストの昇順ソート確認
    const sortedByCost = comparisonTable.slice().sort((a, b) => a.totalCost - b.totalCost);
    expect(sortedByCost[0].name).toBe('Plan B');
    expect(sortedByCost[1].name).toBe('Plan A');
    expect(sortedByCost[2].name).toBe('Plan C');

    // ROIの降順ソート確認
    const sortedByROI = comparisonTable.slice().sort((a, b) => b.roi - a.roi);
    expect(sortedByROI[0].name).toBe('Plan B');
    expect(sortedByROI[1].name).toBe('Plan C');
    expect(sortedByROI[2].name).toBe('Plan A');

    // プラン間での比較可能性確認
    expect(comparisonTable.length).toBe(3);
    expect(comparisonTable.every(row => typeof row.totalCost === 'number')).toBe(true);
    expect(comparisonTable.every(row => typeof row.roi === 'number')).toBe(true);
  });
});