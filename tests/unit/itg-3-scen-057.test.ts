import { calculateAnnualSavings, calculateROI, calculatePaybackPeriod } from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforceライセンス廃止後の削減効果検証機能", () => {
  // SCEN-057
  test("年間削減額・ROI・投資回収期間が正確に計算される", () => {
    // シナリオ1: 基本的なライセンス廃止シナリオ
    // 月額コスト: 50,000円
    // 廃止までの残月数: 12ヶ月
    // 初期投資額: 3,000,000円
    const scenario1_monthlyLicenseCost = 50000;
    const scenario1_remainingMonths = 12;
    const scenario1_initialInvestment = 3000000;

    // 年間削減額 = 月額コスト × 廃止までの残月数
    // = 50,000 × 12 = 600,000
    const scenario1_expectedAnnualSavings = 600000;
    const scenario1_annualSavings = calculateAnnualSavings(
      scenario1_monthlyLicenseCost,
      scenario1_remainingMonths
    );
    expect(scenario1_annualSavings).toBe(scenario1_expectedAnnualSavings);

    // ROI = (削減額 ÷ 初期投資額) × 100
    // = (600,000 ÷ 3,000,000) × 100 = 20
    const scenario1_expectedROI = 20;
    const scenario1_roi = calculateROI(
      scenario1_annualSavings,
      scenario1_initialInvestment
    );
    expect(scenario1_roi).toBe(scenario1_expectedROI);

    // 投資回収期間 = 初期投資額 ÷ 月額削減額
    // 月額削減額 = 600,000 ÷ 12 = 50,000
    // 投資回収期間 = 3,000,000 ÷ 50,000 = 60ヶ月
    const scenario1_monthlySavings = scenario1_monthlyLicenseCost;
    const scenario1_expectedPaybackPeriod = 60;
    const scenario1_paybackPeriod = calculatePaybackPeriod(
      scenario1_initialInvestment,
      scenario1_monthlySavings
    );
    expect(scenario1_paybackPeriod).toBe(scenario1_expectedPaybackPeriod);

    // シナリオ2: より高額なライセンス廃止シナリオ
    // 月額コスト: 150,000円
    // 廃止までの残月数: 8ヶ月
    // 初期投資額: 2,000,000円
    const scenario2_monthlyLicenseCost = 150000;
    const scenario2_remainingMonths = 8;
    const scenario2_initialInvestment = 2000000;

    // 年間削減額 = 150,000 × 8 = 1,200,000
    const scenario2_expectedAnnualSavings = 1200000;
    const scenario2_annualSavings = calculateAnnualSavings(
      scenario2_monthlyLicenseCost,
      scenario2_remainingMonths
    );
    expect(scenario2_annualSavings).toBe(scenario2_expectedAnnualSavings);

    // ROI = (1,200,000 ÷ 2,000,000) × 100 = 60
    const scenario2_expectedROI = 60;
    const scenario2_roi = calculateROI(
      scenario2_annualSavings,
      scenario2_initialInvestment
    );
    expect(scenario2_roi).toBe(scenario2_expectedROI);

    // 月額削減額 = 150,000
    // 投資回収期間 = 2,000,000 ÷ 150,000 ≈ 13.33ヶ月
    const scenario2_monthlySavings = scenario2_monthlyLicenseCost;
    const scenario2_expectedPaybackPeriod = 13.33;
    const scenario2_paybackPeriod = calculatePaybackPeriod(
      scenario2_initialInvestment,
      scenario2_monthlySavings
    );
    expect(scenario2_paybackPeriod).toBeCloseTo(scenario2_expectedPaybackPeriod, 2);

    // シナリオ3: 複数ライセンス統合廃止シナリオ
    // 月額コスト: 300,000円
    // 廃止までの残月数: 6ヶ月
    // 初期投資額: 5,000,000円
    const scenario3_monthlyLicenseCost = 300000;
    const scenario3_remainingMonths = 6;
    const scenario3_initialInvestment = 5000000;

    // 年間削減額 = 300,000 × 6 = 1,800,000
    const scenario3_expectedAnnualSavings = 1800000;
    const scenario3_annualSavings = calculateAnnualSavings(
      scenario3_monthlyLicenseCost,
      scenario3_remainingMonths
    );
    expect(scenario3_annualSavings).toBe(scenario3_expectedAnnualSavings);

    // ROI = (1,800,000 ÷ 5,000,000) × 100 = 36
    const scenario3_expectedROI = 36;
    const scenario3_roi = calculateROI(
      scenario3_annualSavings,
      scenario3_initialInvestment
    );
    expect(scenario3_roi).toBe(scenario3_expectedROI);

    // 月額削減額 = 300,000
    // 投資回収期間 = 5,000,000 ÷ 300,000 ≈ 16.67ヶ月
    const scenario3_monthlySavings = scenario3_monthlyLicenseCost;
    const scenario3_expectedPaybackPeriod = 16.67;
    const scenario3_paybackPeriod = calculatePaybackPeriod(
      scenario3_initialInvestment,
      scenario3_monthlySavings
    );
    expect(scenario3_paybackPeriod).toBeCloseTo(scenario3_expectedPaybackPeriod, 2);

    // シナリオ4: 短期回収シナリオ
    // 月額コスト: 100,000円
    // 廃止までの残月数: 24ヶ月
    // 初期投資額: 1,000,000円
    const scenario4_monthlyLicenseCost = 100000;
    const scenario4_remainingMonths = 24;
    const scenario4_initialInvestment = 1000000;

    // 年間削減額 = 100,000 × 24 = 2,400,000
    const scenario4_expectedAnnualSavings = 2400000;
    const scenario4_annualSavings = calculateAnnualSavings(
      scenario4_monthlyLicenseCost,
      scenario4_remainingMonths
    );
    expect(scenario4_annualSavings).toBe(scenario4_expectedAnnualSavings);

    // ROI = (2,400,000 ÷ 1,000,000) × 100 = 240
    const scenario4_expectedROI = 240;
    const scenario4_roi = calculateROI(
      scenario4_annualSavings,
      scenario4_initialInvestment
    );
    expect(scenario4_roi).toBe(scenario4_expectedROI);

    // 月額削減額 = 100,000
    // 投資回収期間 = 1,000,000 ÷ 100,000 = 10ヶ月
    const scenario4_monthlySavings = scenario4_monthlyLicenseCost;
    const scenario4_expectedPaybackPeriod = 10;
    const scenario4_paybackPeriod = calculatePaybackPeriod(
      scenario4_initialInvestment,
      scenario4_monthlySavings
    );
    expect(scenario4_paybackPeriod).toBe(scenario4_expectedPaybackPeriod);

    // シナリオ5: 境界値テスト - 最小削減額
    // 月額コスト: 10,000円
    // 廃止までの残月数: 1ヶ月
    // 初期投資額: 500,000円
    const scenario5_monthlyLicenseCost = 10000;
    const scenario5_remainingMonths = 1;
    const scenario5_initialInvestment = 500000;

    // 年間削減額 = 10,000 × 1 = 10,000
    const scenario5_expectedAnnualSavings = 10000;
    const scenario5_annualSavings = calculateAnnualSavings(
      scenario5_monthlyLicenseCost,
      scenario5_remainingMonths
    );
    expect(scenario5_annualSavings).toBe(scenario5_expectedAnnualSavings);

    // ROI = (10,000 ÷ 500,000) × 100 = 2
    const scenario5_expectedROI = 2;
    const scenario5_roi = calculateROI(
      scenario5_annualSavings,
      scenario5_initialInvestment
    );
    expect(scenario5_roi).toBe(scenario5_expectedROI);

    // 月額削減額 = 10,000
    // 投資回収期間 = 500,000 ÷ 10,000 = 50ヶ月
    const scenario5_monthlySavings = scenario5_monthlyLicenseCost;
    const scenario5_expectedPaybackPeriod = 50;
    const scenario5_paybackPeriod = calculatePaybackPeriod(
      scenario5_initialInvestment,
      scenario5_monthlySavings
    );
    expect(scenario5_paybackPeriod).toBe(scenario5_expectedPaybackPeriod);
  });
});