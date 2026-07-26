import { generateMonthlyReportWithZeroCustomerDetails } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-124
  test("月次営業成績報告書生成機能 - 顧客別詳細が0件の報告書でも統一フォーマットで正常に生成される", () => {
    const reportGenerationInput = {
      user_id: "USR_ADMIN_001",
      user_role: "admin",
      target_month: "2024-03",
      customer_details: [] as Array<{
        customer_id: string;
        customer_name: string;
        sales_amount: number;
        deal_count: number;
      }>,
      total_sales: 0,
      total_deal_count: 0,
      progress_rate: 0,
      report_format: "unified",
      include_header: true,
      include_footer: true,
      include_company_logo: true,
      font_name: "Arial",
      font_size: 11,
      header_text: "Monthly Sales Report",
      footer_text: "Generated on 2024-03-31",
      title_text: "Sales Performance Report - March 2024",
    };

    const generatedReport = generateMonthlyReportWithZeroCustomerDetails(
      reportGenerationInput
    );

    expect(generatedReport).toBeDefined();
    expect(generatedReport.status).toBe("success");
    expect(generatedReport.report_id).toBeDefined();
    expect(generatedReport.report_id).toMatch(/^RPT_/);

    expect(generatedReport.file_format).toBe("unified");
    expect(generatedReport.file_path).toBeDefined();
    expect(generatedReport.file_path).toMatch(/\.xlsx$|\.pdf$/);

    expect(generatedReport.header).toBeDefined();
    expect(generatedReport.header.present).toBe(true);
    expect(generatedReport.header.text).toBe("Monthly Sales Report");
    expect(generatedReport.header.font_name).toBe("Arial");
    expect(generatedReport.header.font_size).toBe(11);

    expect(generatedReport.footer).toBeDefined();
    expect(generatedReport.footer.present).toBe(true);
    expect(generatedReport.footer.text).toBe("Generated on 2024-03-31");
    expect(generatedReport.footer.font_name).toBe("Arial");
    expect(generatedReport.footer.font_size).toBe(11);

    expect(generatedReport.company_logo).toBeDefined();
    expect(generatedReport.company_logo.present).toBe(true);

    expect(generatedReport.title).toBeDefined();
    expect(generatedReport.title.text).toBe("Sales Performance Report - March 2024");
    expect(generatedReport.title.font_name).toBe("Arial");
    expect(generatedReport.title.font_size).toBe(11);

    expect(generatedReport.aggregation_results).toBeDefined();
    expect(generatedReport.aggregation_results.total_sales).toBe(0);
    expect(generatedReport.aggregation_results.total_deal_count).toBe(0);
    expect(generatedReport.aggregation_results.progress_rate).toBe(0);

    expect(generatedReport.customer_details_section).toBeDefined();
    expect(generatedReport.customer_details_section.present).toBe(true);
    expect(generatedReport.customer_details_section.record_count).toBe(0);
    expect(generatedReport.customer_details_section.rows).toEqual([]);

    expect(generatedReport.formatting).toBeDefined();
    expect(generatedReport.formatting.cell_format_consistent).toBe(true);
    expect(generatedReport.formatting.font_consistent).toBe(true);
    expect(generatedReport.formatting.color_consistent).toBe(true);

    expect(generatedReport.generation_timestamp).toBeDefined();
    expect(generatedReport.generation_timestamp).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
    );

    expect(generatedReport.error_message).toBeUndefined();
    expect(generatedReport.system_error_occurred).toBe(false);
  });
});