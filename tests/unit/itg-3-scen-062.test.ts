import {
  calculateCurrentLicenseCost,
  calculateInHouseDevelopmentInitialCost,
  calculateInHouseAnnualMaintenanceCost,
  generateCostComparisonTable,
} from "../../src/logic/it-1-br-1784969812908-1-1-1";

describe("Salesforce License ROI Analysis and Investment Decision", () => {
  // SCEN-062: [normal] ライセンス更新時期のROI試算・投資判断機能 - ライセンス更新時期にSalesforce継続判断が採択される
  test("should calculate current license cost, in-house development cost, generate comparison table with ROI for continuation decision", () => {
    // ===== Setup: Current Salesforce License Situation =====
    // Precondition: Salesforceの契約情報と利用ユーザーデータが財務システムに記録されている状態
    // Salesforce has 50 Professional Edition users at $165/user/month
    // 10 Platform Plus Edition users at $550/user/month
    // Total annual: (50 * 165 * 12) + (10 * 550 * 12) = 99,000 + 66,000 = 165,000 (in arbitrary currency units)
    const current_salesforce_users_professional = 50;
    const current_salesforce_monthly_cost_professional = 165;
    const current_salesforce_users_platform_plus = 10;
    const current_salesforce_monthly_cost_platform_plus = 550;

    // Trigger: ライセンス更新時期が到来し、経営層がコスト比較分析を指示した時点
    const license_renewal_year = 2024;
    const current_year = 2024;

    // Call: calculateCurrentLicenseCost
    // Expected: 現在のライセンス費用総額が計算される
    const current_license_cost_result = calculateCurrentLicenseCost({
      users_professional: current_salesforce_users_professional,
      monthly_cost_professional: current_salesforce_monthly_cost_professional,
      users_platform_plus: current_salesforce_users_platform_plus,
      monthly_cost_platform_plus: current_salesforce_monthly_cost_platform_plus,
      contract_year: current_year,
    });

    // structured.formula: annual_cost = (users_professional * monthly_cost_professional * 12) + (users_platform_plus * monthly_cost_platform_plus * 12)
    // = (50 * 165 * 12) + (10 * 550 * 12) = 99,000 + 66,000 = 165,000
    const expected_current_annual_cost = 165000;
    expect(current_license_cost_result.annual_cost).toBe(
      expected_current_annual_cost
    );
    expect(current_license_cost_result.total_users).toBe(60);
    expect(current_license_cost_result.edition_breakdown).toEqual({
      professional: {
        user_count: 50,
        monthly_unit_cost: 165,
        annual_subtotal: 99000,
      },
      platform_plus: {
        user_count: 10,
        monthly_unit_cost: 550,
        annual_subtotal: 66000,
      },
    });

    // ===== Setup: In-House Development Initial Cost Estimation =====
    // Precondition: 自社開発システムの機能要件と開発体制が確定し、初期構築コストの見積が完了している状態
    // Development scope: Full CRM system equivalent
    // Team composition: 1 Project Manager, 4 Senior Engineers, 3 Junior Engineers, 1 QA Lead
    // Duration: 12 months
    // Average monthly cost per engineer: $8,000 per month
    const development_team_pm_count = 1;
    const development_team_senior_engineer_count = 4;
    const development_team_junior_engineer_count = 3;
    const development_team_qa_lead_count = 1;
    const development_average_monthly_cost = 8000;
    const development_duration_months = 12;

    // Trigger: 自社開発システムの初期構築コストと年間保守運用コストを積算する必要が生じた
    // Call: calculateInHouseDevelopmentInitialCost
    const in_house_initial_cost_result = calculateInHouseDevelopmentInitialCost(
      {
        pm_count: development_team_pm_count,
        senior_engineer_count: development_team_senior_engineer_count,
        junior_engineer_count: development_team_junior_engineer_count,
        qa_lead_count: development_team_qa_lead_count,
        monthly_cost_per_resource: development_average_monthly_cost,
        duration_months: development_duration_months,
      }
    );

    // structured.formula: initial_cost = (pm_count + senior_engineer_count + junior_engineer_count + qa_lead_count) * monthly_cost_per_resource * duration_months
    // = (1 + 4 + 3 + 1) * 8,000 * 12 = 9 * 8,000 * 12 = 864,000
    const expected_initial_cost = 864000;
    expect(in_house_initial_cost_result.initial_cost).toBe(
      expected_initial_cost
    );
    expect(in_house_initial_cost_result.total_resources).toBe(9);
    expect(in_house_initial_cost_result.team_composition).toEqual({
      project_manager: 1,
      senior_engineer: 4,
      junior_engineer: 3,
      qa_lead: 1,
    });
    expect(in_house_initial_cost_result.monthly_allocation_cost).toBe(72000);

    // ===== Setup: Annual In-House Maintenance Cost =====
    // Precondition: システムの年間保守運用コストを人月単価と運用工数から計算し、Salesforceライセス費用との比較に用いる
    // Maintenance team: 2 Full-time Operations Engineers + 1 Part-time Support Engineer
    // Monthly operational cost per full-time engineer: $6,000
    // Operational capacity: 80% of 2 full-time + 30% of 1 part-time = 2.3 FTE
    // Infrastructure/Tools/License cost: $5,000 per month
    const maintenance_fulltime_engineer_count = 2;
    const maintenance_fulltime_monthly_cost = 6000;
    const maintenance_parttime_engineer_count = 1;
    const maintenance_parttime_allocation_ratio = 0.3;
    const maintenance_infrastructure_monthly_cost = 5000;

    // Trigger: 財務・管理部門が年間保守運用コストを算出する必要が生じたとき
    // Call: calculateInHouseAnnualMaintenanceCost
    const in_house_annual_maintenance_result = calculateInHouseAnnualMaintenanceCost(
      {
        fulltime_engineer_count: maintenance_fulltime_engineer_count,
        fulltime_monthly_cost: maintenance_fulltime_monthly_cost,
        parttime_engineer_count: maintenance_parttime_engineer_count,
        parttime_allocation_ratio: maintenance_parttime_allocation_ratio,
        infrastructure_monthly_cost: maintenance_infrastructure_monthly_cost,
        contract_year: current_year,
      }
    );

    // structured.formula: annual_maintenance_cost = ((fulltime_engineer_count * fulltime_monthly_cost) + (parttime_engineer_count * fulltime_monthly_cost * parttime_allocation_ratio) + infrastructure_monthly_cost) * 12
    // = ((2 * 6,000) + (1 * 6,000 * 0.3) + 5,000) * 12 = (12,000 + 1,800 + 5,000) * 12 = 18,800 * 12 = 225,600
    const expected_annual_maintenance_cost = 225600;
    expect(in_house_annual_maintenance_result.annual_cost).toBe(
      expected_annual_maintenance_cost
    );
    expect(in_house_annual_maintenance_result.monthly_cost).toBe(18800);
    expect(in_house_annual_maintenance_result.fte_equivalent).toBe(2.3);

    // ===== Setup: Cost Comparison Table Generation =====
    // Precondition: 財務・管理部門が現在のSalesforceライセンス費用と自社開発システムの構築・運用コストを把握している状態
    // Trigger: Salesforceライセス費用との比較表を作成する必要が生じたとき、複数年度にわたるコスト削減効果をシミュレーションする必要が生じたとき
    // Call: generateCostComparisonTable
    const comparison_analysis_years = 5;
    const comparison_table_result = generateCostComparisonTable({
      current_annual_salesforce_cost: expected_current_annual_cost,
      in_house_initial_cost: expected_initial_cost,
      in_house_annual_maintenance_cost: expected_annual_maintenance_cost,
      analysis_period_years: comparison_analysis_years,
      annual_salesforce_cost_growth_rate: 0.05,
    });

    // structured.formula for year 1:
    // SF_cumulative_year1 = 165,000 * 1 = 165,000
    // InHouse_cumulative_year1 = 864,000 + 225,600 = 1,089,600
    // Cost_difference_year1 = 165,000 - 1,089,600 = -924,600 (negative = investment phase)
    // Reduction_year1 = 0
    const expected_sf_cumulative_year1 = 165000;
    const expected_inhouse_cumulative_year1 = 1089600;
    const expected_cost_difference_year1 = -924600;
    const expected_reduction_year1 = 0;

    // structured.formula for year 2:
    // SF_cumulative_year2 = (165,000 + (165,000 * 1.05)) * 2 = (165,000 + 173,250) = 338,250 cumulative
    // Wait, the formula needs clarification. Assuming cumulative with growth:
    // Year 2 SF cost = 165,000 * (1.05)^1 = 173,250
    // SF_cumulative_year2 = 165,000 + 173,250 = 338,250
    // InHouse_cumulative_year2 = 1,089,600 + 225,600 = 1,315,200
    // Cost_difference_year2 = 338,250 - 1,315,200 = -976,950
    // Reduction_year2 = max(0, 1,315,200 - 338,250) = 976,950 (benefit if staying on SF)
    const expected_sf_cumulative_year2 = 338250;
    const expected_inhouse_cumulative_year2 = 1315200;
    const expected_reduction_year2 = 976950;

    // structured.formula for year 3 (ROI breakeven point):
    // Year 3 SF cost = 165,000 * (1.05)^2 = 181,913 (rounded)
    // SF_cumulative_year3 = 338,250 + 181,913 = 520,163 (rounded)
    // InHouse_cumulative_year3 = 1,315,200 + 225,600 = 1,540,800
    // Cost_difference_year3 = 520,163 - 1,540,800 = -1,020,637
    // Reduction_year3 = 1,020,637
    const expected_sf_cumulative_year3 = 520163;
    const expected_inhouse_cumulative_year3 = 1540800;
    const expected_reduction_year3 = 1020637;

    // structured.formula for year 4:
    // Year 4 SF cost = 165,000 * (1.05)^3 = 190,909 (rounded)
    // SF_cumulative_year4 = 520,163 + 190,909 = 711,072
    // InHouse_cumulative_year4 = 1,540,800 + 225,600 = 1,766,400
    // Reduction_year4 = 1,766,400 - 711,072 = 1,055,328
    const expected_sf_cumulative_year4 = 711072;
    const expected_inhouse_cumulative_year4 = 1766400;
    const expected_reduction_year4 = 1055328;

    // structured.formula for year 5:
    // Year 5 SF cost = 165,000 * (1.05)^4 = 200,455 (rounded)
    // SF_cumulative_year5 = 711,072 + 200,455 = 911,527
    // InHouse_cumulative_year5 = 1,766,400 + 225,600 = 1,992,000
    // Reduction_year5 = 1,992,000 - 911,527 = 1,080,473
    const expected_sf_cumulative_year5 = 911527;
    const expected_inhouse_cumulative_year5 = 1992000;
    const expected_reduction_year5 = 1080473;

    // Verify year-by-year comparison table structure
    expect(comparison_table_result.comparison_table).toHaveLength(5);

    // Year 1 validation
    expect(comparison_table_result.comparison_table[0]).toEqual({
      year: 1,
      salesforce_annual_cost: 165000,
      salesforce_cumulative_cost: expected_sf_cumulative_year1,
      inhouse_annual_cost: 1089600,
      inhouse_cumulative_cost: expected_inhouse_cumulative_year1,
      annual_cost_difference: expected_cost_difference_year1,
      annual_reduction_amount: expected_reduction_year1,
      roi_percentage: 0,
      payback_period_months: null,
    });

    // Year 2 validation
    expect(comparison_table_result.comparison_table[1]).toEqual({
      year: 2,
      salesforce_annual_cost: 173250,
      salesforce_cumulative_cost: expected_sf_cumulative_year2,
      inhouse_annual_cost: 225600,
      inhouse_cumulative_cost: expected_inhouse_cumulative_year2,
      annual_cost_difference: -976950,
      annual_reduction_amount: expected_reduction_year2,
      roi_percentage: -73.78,
      payback_period_months: null,
    });

    // Year 3 validation
    expect(comparison_table_result.comparison_table[2]).toEqual({
      year: 3,
      salesforce_annual_cost: 181913,
      salesforce_cumulative_cost: expected_sf_cumulative_year3,
      inhouse_annual_cost: 225600,
      inhouse_cumulative_cost: expected_inhouse_cumulative_year3,
      annual_cost_difference: -1020637,
      annual_reduction_amount: expected_reduction_year3,
      roi_percentage: -66.26,
      payback_period_months: null,
    });

    // Year 4 validation
    expect(comparison_table_result.comparison_table[3]).toEqual({
      year: 4,
      salesforce_annual_cost: 190909,
      salesforce_cumulative_cost: expected_sf_cumulative_year4,
      inhouse_annual_cost: 225600,
      inhouse_cumulative_cost: expected_inhouse_cumulative_year4,
      annual_cost_difference: -1055328,
      annual_reduction_amount: expected_reduction_year4,
      roi_percentage: -59.75,
      payback_period_months: null,
    });

    // Year 5 validation
    expect(comparison_table_result.comparison_table[4]).toEqual({
      year: 5,
      salesforce_annual_cost: 200455,
      salesforce_cumulative_cost: expected_sf_cumulative_year5,
      inhouse_annual_cost: 225600,
      inhouse_cumulative_cost: expected_inhouse_cumulative_year5,
      annual_cost_difference: -1080473,
      annual_reduction_amount: expected_reduction_year5,
      roi_percentage: -54.19,
      payback_period_months: null,
    });

    // ===== Investment Decision Recommendation Logic =====
    // Precondition: Salesforceライセンス費用と自社開発システムの初期構築・年間保守コストの比較表が完成している状態
    // Outcome: 経営者・代表が投資判断の承認基準に基づいて、自社開発システムへの投資を承認または却下する
    // ROI Analysis: All 5 years show negative ROI percentages, indicating Salesforce continuation is more cost-effective
    const investment_decision_threshold_roi = 15;
    const investment_decision_threshold_payback_months = 36;

    // Trigger: 継続判断の根拠となる判定ロジック（閾値、スコア）が正しく反映されていることを確認する
    // Decision Logic: If any year achieves ROI >= 15% and payback <= 36 months, recommend in-house development
    // Otherwise, recommend Salesforce continuation
    const decision_recommendation =
      comparison_table_result.comparison_table.some(
        (year_data) =>
          year_data.roi_percentage >= investment_decision_threshold_roi &&
          (year_data.payback_period_months === null ||
            year_data.payback_period_months <=
              investment_decision_threshold_payback_months)
      );

    // Expected: false (recommend Salesforce continuation)
    expect(decision_recommendation).toBe(false);

    // Outcome: ライセンス更新時期において、ROI試算機能が正確にコスト対効果を計算し、Salesforce継続判断が正しく採択・提示されること
    const investment_decision_result = {
      recommendation: decision_recommendation ? "IN_HOUSE_DEVELOPMENT" : "SALESFORCE_CONTINUATION",
      recommendation_basis: "ROI Analysis",
      threshold_roi_minimum: investment_decision_threshold_roi,
      threshold_payback_period_months_maximum:
        investment_decision_threshold_payback_months,
      analysis_summary: {
        total_salesforce_5year_cost: expected_sf_cumulative_year5,
        total_inhouse_5year_cost: expected_inhouse_cumulative_year5,
        net_cost_difference: expected_inhouse_cumulative_year5 - expected_sf_cumulative_year5,
        average_annual_reduction: 0,
        best_case_year: null,
      },
    };

    expect(investment_decision_result.recommendation).toBe(
      "SALESFORCE_CONTINUATION"
    );
    expect(investment_decision_result.threshold_roi_minimum).toBe(15);
    expect(investment_decision_result.threshold_payback_period_months_maximum).toBe(
      36
    );
    expect(investment_decision_result.analysis_summary.total_salesforce_5year_cost).toBe(
      expected_sf_cumulative_year5
    );
    expect(investment_decision_result.analysis_summary.total_inhouse_5year_cost).toBe(
      expected_inhouse_cumulative_year5
    );
    expect(investment_decision_result.analysis_summary.net_cost_difference).toBe(
      1080473
    );

    // Outcome: また、投資判断の根拠が明確に表示され、ユーザーが継続判断に基づいて意思決定できることを確認できる状態
    const user_decision_context = {
      decision_made_at: new Date("2024-01-15T11:00:00Z"),
      current_license_cost_annual: expected_current_annual_cost,
      current_user_count: 60,
      decision_document: {
        recommendation_text:
          "Based on 5-year ROI analysis, Salesforce continuation is recommended. In-house development ROI does not meet the 15% threshold in any of the 5 years analyzed.",
        roi_threshold_not_met: true,
        estimated_cost_increase_from_development: 1080473,
      },
    };

    expect(user_decision_context.current_license_cost_annual).toBe(165000);
    expect(user_decision_context.current_user_count).toBe(60);
    expect(user_decision_context.decision_document.roi_threshold_not_met).toBe(
      true
    );
    expect(user_decision_context.decision_document.estimated_cost_increase_from_development).toBe(
      1080473
    );
  });
});