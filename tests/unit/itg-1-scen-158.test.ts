import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  aggregateMonthlySalesAndInvoices,
  validateAggregationConsistency,
  generateAggregationReport,
  exportAggregationData,
} from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-158: [normal] 売上実績・請求状況自動集計機能 - 月次決算対象期間内の請求金額と売上実績の金額が一致する場合、正確に集計される
  it("should accurately aggregate monthly sales and invoice amounts when they match completely within the settlement period", () => {
    // Arrange: テストデータの準備
    const settlement_period_start = new Date("2024-04-01T00:00:00Z");
    const settlement_period_end = new Date("2024-04-30T23:59:59Z");

    const transaction_records = [
      {
        transaction_id: "TRX001",
        customer_id: "CUST001",
        invoice_date: new Date("2024-04-05T10:00:00Z"),
        invoice_amount: 100000,
        sales_amount: 100000,
        invoice_status: "issued",
        sales_status: "recorded",
      },
      {
        transaction_id: "TRX002",
        customer_id: "CUST002",
        invoice_date: new Date("2024-04-12T14:30:00Z"),
        invoice_amount: 250000,
        sales_amount: 250000,
        invoice_status: "issued",
        sales_status: "recorded",
      },
      {
        transaction_id: "TRX003",
        customer_id: "CUST003",
        invoice_date: new Date("2024-04-20T09:15:00Z"),
        invoice_amount: 150000,
        sales_amount: 150000,
        invoice_status: "issued",
        sales_status: "recorded",
      },
    ];

    // Act: 月次決算対象期間内の売上実績・請求状況の自動集計を実行
    const aggregation_result = aggregateMonthlySalesAndInvoices({
      period_start: settlement_period_start,
      period_end: settlement_period_end,
      transactions: transaction_records,
    });

    // Assert: 集計結果が正確に計算されていることを検証
    expect(aggregation_result.total_invoice_amount).toBe(500000);
    expect(aggregation_result.total_sales_amount).toBe(500000);
    expect(aggregation_result.transaction_count).toBe(3);
    expect(aggregation_result.amounts_match).toBe(true);
    expect(aggregation_result.discrepancy).toBe(0);

    // Assert: 集計結果の請求金額合計と売上実績合計が一致していることを検証
    expect(aggregation_result.total_invoice_amount).toEqual(
      aggregation_result.total_sales_amount
    );

    // Act: 集計結果の整合性を検証
    const consistency_validation = validateAggregationConsistency(
      aggregation_result
    );

    // Assert: 整合性検証が成功することを検証
    expect(consistency_validation.is_consistent).toBe(true);
    expect(consistency_validation.validation_status).toBe("passed");

    // Act: 明細行が正確に含まれていることを確認するため、ドリルダウン可能な詳細結果を生成
    const detail_breakdown = aggregation_result.transaction_details;

    // Assert: 各取引レコードが正確に含まれていることを検証
    expect(detail_breakdown).toHaveLength(3);
    expect(detail_breakdown[0]).toEqual({
      transaction_id: "TRX001",
      customer_id: "CUST001",
      invoice_amount: 100000,
      sales_amount: 100000,
      match_status: "matched",
    });
    expect(detail_breakdown[1]).toEqual({
      transaction_id: "TRX002",
      customer_id: "CUST002",
      invoice_amount: 250000,
      sales_amount: 250000,
      match_status: "matched",
    });
    expect(detail_breakdown[2]).toEqual({
      transaction_id: "TRX003",
      customer_id: "CUST003",
      invoice_amount: 150000,
      sales_amount: 150000,
      match_status: "matched",
    });

    // Act: 集計結果レポートを生成
    const report = generateAggregationReport({
      aggregation_result: aggregation_result,
      period_start: settlement_period_start,
      period_end: settlement_period_end,
      include_details: true,
    });

    // Assert: レポートが正しく生成されていることを検証
    expect(report.report_title).toBe("月次売上実績・請求状況集計報告");
    expect(report.settlement_period_start).toEqual(settlement_period_start);
    expect(report.settlement_period_end).toEqual(settlement_period_end);
    expect(report.summary_section).toEqual({
      total_invoice_amount: 500000,
      total_sales_amount: 500000,
      transaction_count: 3,
      amounts_match: true,
      discrepancy: 0,
    });
    expect(report.details_section).toHaveLength(3);

    // Act: CSV形式でエクスポート
    const csv_export_result = exportAggregationData({
      data: report,
      format: "csv",
      filename: "aggregation_report_202404.csv",
    });

    // Assert: CSV エクスポートが成功したことを検証
    expect(csv_export_result.export_status).toBe("success");
    expect(csv_export_result.format).toBe("csv");
    expect(csv_export_result.file_size).toBeGreaterThan(0);

    // Act: PDF形式でエクスポート
    const pdf_export_result = exportAggregationData({
      data: report,
      format: "pdf",
      filename: "aggregation_report_202404.pdf",
    });

    // Assert: PDF エクスポートが成功したことを検証
    expect(pdf_export_result.export_status).toBe("success");
    expect(pdf_export_result.format).toBe("pdf");
    expect(pdf_export_result.file_size).toBeGreaterThan(0);

    // Act: エクスポートされたデータの集計値を検証
    const exported_summary = csv_export_result.exported_summary;

    // Assert: エクスポートされたデータの集計値が画面表示値と一致することを検証
    expect(exported_summary.total_invoice_amount).toBe(500000);
    expect(exported_summary.total_sales_amount).toBe(500000);
    expect(exported_summary.transaction_count).toBe(3);
    expect(exported_summary.total_invoice_amount).toEqual(
      exported_summary.total_sales_amount
    );
  });
});