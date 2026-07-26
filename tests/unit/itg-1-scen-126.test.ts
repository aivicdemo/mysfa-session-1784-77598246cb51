import { generateMonthlySalesReport } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-126
  test("月次営業成績報告書生成機能 - 売上が0円の場合も正常に報告書が生成される", () => {
    const input_period_start = new Date("2024-04-01");
    const input_period_end = new Date("2024-04-30");
    const input_sales_amount = 0;
    const input_order_count = 0;
    const input_proposal_count = 5;
    const input_department = "営業部A";
    const input_sales_person_id = "USER001";
    const input_sales_person_name = "山田太郎";
    const input_customer_deals = [
      {
        customer_id: "CUST001",
        customer_name: "顧客A",
        deals: [
          {
            deal_id: "DEAL001",
            deal_status: "初期接触",
            deal_amount: 0,
            deal_count: 1,
          },
          {
            deal_id: "DEAL002",
            deal_status: "提案中",
            deal_amount: 0,
            deal_count: 1,
          },
          {
            deal_id: "DEAL003",
            deal_status: "交渉中",
            deal_amount: 0,
            deal_count: 1,
          },
          {
            deal_id: "DEAL004",
            deal_status: "受注",
            deal_amount: 0,
            deal_count: 0,
          },
          {
            deal_id: "DEAL005",
            deal_status: "失注",
            deal_amount: 0,
            deal_count: 0,
          },
        ],
      },
    ];

    const result = generateMonthlySalesReport({
      period_start: input_period_start,
      period_end: input_period_end,
      sales_amount: input_sales_amount,
      order_count: input_order_count,
      proposal_count: input_proposal_count,
      department: input_department,
      sales_person_id: input_sales_person_id,
      sales_person_name: input_sales_person_name,
      customer_deals: input_customer_deals,
    });

    expect(result).toBeDefined();
    expect(result.report_id).toBeDefined();
    expect(result.report_id.length).toBeGreaterThan(0);

    expect(result.period_start).toEqual(input_period_start);
    expect(result.period_end).toEqual(input_period_end);

    expect(result.sales_amount).toBe(0);
    expect(result.order_count).toBe(0);
    expect(result.proposal_count).toBe(5);

    const progress_rate =
      input_proposal_count > 0
        ? Math.round((input_order_count / input_proposal_count) * 10000) / 100
        : 0;
    expect(result.progress_rate).toBe(progress_rate);

    expect(result.department).toBe(input_department);
    expect(result.sales_person_id).toBe(input_sales_person_id);
    expect(result.sales_person_name).toBe(input_sales_person_name);

    expect(result.customer_deals).toBeDefined();
    expect(result.customer_deals.length).toBe(1);

    const customer_summary = result.customer_deals[0];
    expect(customer_summary.customer_id).toBe("CUST001");
    expect(customer_summary.customer_name).toBe("顧客A");

    expect(customer_summary.deals_by_status).toBeDefined();
    expect(customer_summary.deals_by_status["初期接触"]).toEqual({
      count: 1,
      total_amount: 0,
    });
    expect(customer_summary.deals_by_status["提案中"]).toEqual({
      count: 1,
      total_amount: 0,
    });
    expect(customer_summary.deals_by_status["交渉中"]).toEqual({
      count: 1,
      total_amount: 0,
    });
    expect(customer_summary.deals_by_status["受注"]).toEqual({
      count: 0,
      total_amount: 0,
    });
    expect(customer_summary.deals_by_status["失注"]).toEqual({
      count: 0,
      total_amount: 0,
    });

    expect(result.generated_at).toBeDefined();
    expect(result.generated_at instanceof Date).toBe(true);

    expect(result.format_version).toBe("1.0");

    expect(result.has_errors).toBe(false);
    expect(result.error_messages.length).toBe(0);

    expect(result.file_path).toBeDefined();
    expect(result.file_path.length).toBeGreaterThan(0);
  });
});