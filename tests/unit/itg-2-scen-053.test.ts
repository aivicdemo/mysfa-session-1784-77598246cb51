import { validateReportDataAccuracy } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-053
  test("報告書データ検証機能 - 報告書の売上・件数・進捗率・顧客別商談状況が営業管理システムの元データと完全に一致する", () => {
    const source_system_data = {
      total_sales: 5000000,
      deal_count: 12,
      progress_rate: 75.5,
      customer_deals: [
        {
          customer_id: "CUST001",
          customer_name: "A社",
          deals: [
            {
              deal_id: "DEAL001",
              status: "受注",
              amount: 1500000,
            },
            {
              deal_id: "DEAL002",
              status: "提案中",
              amount: 800000,
            },
          ],
        },
        {
          customer_id: "CUST002",
          customer_name: "B社",
          deals: [
            {
              deal_id: "DEAL003",
              status: "受注",
              amount: 2700000,
            },
          ],
        },
      ],
    };

    const portal_report_data = {
      total_sales: 5000000,
      deal_count: 12,
      progress_rate: 75.5,
      customer_deals: [
        {
          customer_id: "CUST001",
          customer_name: "A社",
          deals: [
            {
              deal_id: "DEAL001",
              status: "受注",
              amount: 1500000,
            },
            {
              deal_id: "DEAL002",
              status: "提案中",
              amount: 800000,
            },
          ],
        },
        {
          customer_id: "CUST002",
          customer_name: "B社",
          deals: [
            {
              deal_id: "DEAL003",
              status: "受注",
              amount: 2700000,
            },
          ],
        },
      ],
    };

    const validation_result = validateReportDataAccuracy(
      source_system_data,
      portal_report_data
    );

    expect(validation_result.sales_match).toBe(true);
    expect(validation_result.deal_count_match).toBe(true);
    expect(validation_result.progress_rate_match).toBe(true);
    expect(validation_result.customer_deals_match).toBe(true);
    expect(validation_result.all_data_consistent).toBe(true);
    expect(validation_result.validation_status).toBe("PASS");
  });
});