import { calculateLicenseCostComparison } from '../../src/logic/it-1-br-1784969812908-1-1-1';

describe('Salesforceライセンス利用状況の可視化機能', () => {
  // SCEN-048
  test('ROI閾値と等値の削減効果の場合、投資判断が承認される', () => {
    const roi_threshold_percent = 20;
    const current_salesforce_annual_cost = 1000000;
    const system_initial_construction_cost = 500000;
    const system_annual_maintenance_cost = 150000;
    const target_reduction_percent = 20;

    const three_year_salesforce_cumulative_cost = current_salesforce_annual_cost * 3;
    const three_year_system_cumulative_cost = system_initial_construction_cost + system_annual_maintenance_cost * 3;
    const three_year_cost_reduction = three_year_salesforce_cumulative_cost - three_year_system_cumulative_cost;
    const calculated_roi_percent = (three_year_cost_reduction / system_initial_construction_cost) * 100;
    const actual_reduction_percent = (three_year_cost_reduction / three_year_salesforce_cumulative_cost) * 100;

    const input_payload = {
      roi_threshold_percent: roi_threshold_percent,
      current_salesforce_annual_license_cost: current_salesforce_annual_cost,
      system_initial_construction_cost: system_initial_construction_cost,
      system_annual_maintenance_cost: system_annual_maintenance_cost,
      target_reduction_percent: target_reduction_percent,
      approver_user_id: 'USR001',
      approval_timestamp_iso: '2024-12-15T14:30:00Z',
    };

    const result = calculateLicenseCostComparison(input_payload);

    expect(result).toEqual(
      expect.objectContaining({
        approval_status: 'approved',
        is_approved: true,
        roi_percent: calculated_roi_percent,
        actual_reduction_percent: actual_reduction_percent,
        three_year_cumulative_cost_salesforce: three_year_salesforce_cumulative_cost,
        three_year_cumulative_cost_system: three_year_system_cumulative_cost,
        annual_cost_reduction: three_year_cost_reduction / 3,
        approver_user_id: 'USR001',
        approval_datetime: '2024-12-15T14:30:00Z',
      })
    );

    expect(result.is_approved).toBe(true);
    expect(result.approval_status).toBe('approved');
    expect(result.roi_percent).toBeGreaterThanOrEqual(roi_threshold_percent);
    expect(result.approver_user_id).toBe('USR001');
    expect(result.approval_datetime).toBe('2024-12-15T14:30:00Z');
  });
});