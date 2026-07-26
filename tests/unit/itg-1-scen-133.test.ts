import { validateMonthlyReportData } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-133
  test("月次営業成績報告書の売上・請求データ検証 - 報告書の売上金額がシステム元データと1円以上相違する場合、不一致エラーとして検出される", () => {
    const system_source_revenue = 1000000;
    const report_revenue_over = 1000001;
    const report_revenue_under = 999999;

    const valid_report_data = {
      report_id: "RPT-202401-001",
      reporting_period_start: "2024-01-01",
      reporting_period_end: "2024-01-31",
      total_revenue: 1000000,
      order_count: 5,
      progress_rate: 0.75,
      customer_details: [
        {
          customer_id: "CUST-001",
          customer_name: "Test Customer A",
          deals: [
            {
              deal_id: "DEAL-001",
              status: "受注",
              amount: 500000,
            },
            {
              deal_id: "DEAL-002",
              status: "受注",
              amount: 500000,
            },
          ],
        },
      ],
    };

    const mismatched_report_over = {
      ...valid_report_data,
      total_revenue: report_revenue_over,
    };

    const mismatched_report_under = {
      ...valid_report_data,
      total_revenue: report_revenue_under,
    };

    const system_data = {
      total_revenue: system_source_revenue,
      order_count: 5,
      progress_rate: 0.75,
      deals: [
        {
          deal_id: "DEAL-001",
          status: "受注",
          amount: 500000,
        },
        {
          deal_id: "DEAL-002",
          status: "受注",
          amount: 500000,
        },
      ],
    };

    // 正常な報告書は検証に合格
    const valid_result = validateMonthlyReportData(
      valid_report_data,
      system_data
    );
    expect(valid_result.is_valid).toBe(true);
    expect(valid_result.error_code).toBeUndefined();
    expect(valid_result.mismatches).toHaveLength(0);

    // 売上金額が1円多い場合、不一致エラーを検出
    const over_result = validateMonthlyReportData(
      mismatched_report_over,
      system_data
    );
    expect(over_result.is_valid).toBe(false);
    expect(over_result.error_code).toBe("DATA_MISMATCH");
    expect(over_result.mismatches).toHaveLength(1);
    expect(over_result.mismatches[0]).toEqual({
      field: "total_revenue",
      expected_value: system_source_revenue,
      actual_value: report_revenue_over,
      difference: 1,
    });

    // 売上金額が1円少ない場合、不一致エラーを検出
    const under_result = validateMonthlyReportData(
      mismatched_report_under,
      system_data
    );
    expect(under_result.is_valid).toBe(false);
    expect(under_result.error_code).toBe("DATA_MISMATCH");
    expect(under_result.mismatches).toHaveLength(1);
    expect(under_result.mismatches[0]).toEqual({
      field: "total_revenue",
      expected_value: system_source_revenue,
      actual_value: report_revenue_under,
      difference: 1,
    });

    // エラーメッセージに詳細情報が含まれている
    expect(over_result.error_message).toMatch(/売上金額/);
    expect(over_result.error_message).toMatch(/1000000/);
    expect(over_result.error_message).toMatch(/1000001/);

    expect(under_result.error_message).toMatch(/売上金額/);
    expect(under_result.error_message).toMatch(/1000000/);
    expect(under_result.error_message).toMatch(/999999/);

    // 複数フィールドが相違する場合の検出
    const multi_mismatch_report = {
      ...valid_report_data,
      total_revenue: report_revenue_over,
      order_count: 10,
    };

    const multi_result = validateMonthlyReportData(
      multi_mismatch_report,
      system_data
    );
    expect(multi_result.is_valid).toBe(false);
    expect(multi_result.error_code).toBe("DATA_MISMATCH");
    expect(multi_result.mismatches.length).toBeGreaterThanOrEqual(2);

    const revenue_mismatch = multi_result.mismatches.find(
      (m) => m.field === "total_revenue"
    );
    const order_mismatch = multi_result.mismatches.find(
      (m) => m.field === "order_count"
    );

    expect(revenue_mismatch).toBeDefined();
    expect(revenue_mismatch?.difference).toBe(1);
    expect(order_mismatch).toBeDefined();
    expect(order_mismatch?.difference).toBe(5);
  });
});