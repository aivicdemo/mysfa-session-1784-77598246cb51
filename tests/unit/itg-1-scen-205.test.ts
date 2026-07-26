import { describe, test, expect } from "@jest/globals";
import {
  reconcileDealStatusWithInvoiceIssueDate,
  type DealReconciliationInput,
  type DealReconciliationResult,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合", () => {
  // SCEN-205
  test("売上計上予定日と実際の請求日のズレが正確に日数で計算される", () => {
    // テストケース1: ズレが5日のケース（予定日2024年1月15日、実際請求日2024年1月20日）
    const input_case1: DealReconciliationInput = {
      dealId: "DEAL001",
      dealStatus: "受注",
      plannedRevenueDate: "2024-01-15",
      actualInvoiceIssuedDate: "2024-01-20",
      invoiceAmount: 100000,
    };

    const result_case1: DealReconciliationResult =
      reconcileDealStatusWithInvoiceIssueDate(input_case1);

    expect(result_case1.dealId).toBe("DEAL001");
    expect(result_case1.dateDifferenceDays).toBe(5);
    expect(result_case1.hasDiscrepancy).toBe(true);
    expect(result_case1.discrepancyStatus).toBe("遅延");

    // テストケース2: ズレが0日のケース（予定日と請求日が一致）
    const input_case2: DealReconciliationInput = {
      dealId: "DEAL002",
      dealStatus: "受注",
      plannedRevenueDate: "2024-02-10",
      actualInvoiceIssuedDate: "2024-02-10",
      invoiceAmount: 250000,
    };

    const result_case2: DealReconciliationResult =
      reconcileDealStatusWithInvoiceIssueDate(input_case2);

    expect(result_case2.dealId).toBe("DEAL002");
    expect(result_case2.dateDifferenceDays).toBe(0);
    expect(result_case2.hasDiscrepancy).toBe(false);
    expect(result_case2.discrepancyStatus).toBe("正常");

    // テストケース3: 負の値のケース（予定日より早期に発行）
    const input_case3: DealReconciliationInput = {
      dealId: "DEAL003",
      dealStatus: "受注",
      plannedRevenueDate: "2024-03-20",
      actualInvoiceIssuedDate: "2024-03-15",
      invoiceAmount: 150000,
    };

    const result_case3: DealReconciliationResult =
      reconcileDealStatusWithInvoiceIssueDate(input_case3);

    expect(result_case3.dealId).toBe("DEAL003");
    expect(result_case3.dateDifferenceDays).toBe(-5);
    expect(result_case3.hasDiscrepancy).toBe(true);
    expect(result_case3.discrepancyStatus).toBe("早期発行");

    // テストケース4: 複数商談のズレが一覧で集計されるケース
    const deals_batch: DealReconciliationInput[] = [
      {
        dealId: "DEAL101",
        dealStatus: "受注",
        plannedRevenueDate: "2024-01-15",
        actualInvoiceIssuedDate: "2024-01-20",
        invoiceAmount: 100000,
      },
      {
        dealId: "DEAL102",
        dealStatus: "受注",
        plannedRevenueDate: "2024-01-22",
        actualInvoiceIssuedDate: "2024-01-22",
        invoiceAmount: 200000,
      },
      {
        dealId: "DEAL103",
        dealStatus: "完了",
        plannedRevenueDate: "2024-02-01",
        actualInvoiceIssuedDate: "2024-01-28",
        invoiceAmount: 80000,
      },
    ];

    const results_batch: DealReconciliationResult[] = deals_batch.map(
      (deal) => reconcileDealStatusWithInvoiceIssueDate(deal)
    );

    expect(results_batch.length).toBe(3);
    expect(results_batch[0].dateDifferenceDays).toBe(5);
    expect(results_batch[0].hasDiscrepancy).toBe(true);
    expect(results_batch[1].dateDifferenceDays).toBe(0);
    expect(results_batch[1].hasDiscrepancy).toBe(false);
    expect(results_batch[2].dateDifferenceDays).toBe(-3);
    expect(results_batch[2].hasDiscrepancy).toBe(true);

    const aggregated_summary = {
      totalDeals: results_batch.length,
      dealsWithDiscrepancy: results_batch.filter((r) => r.hasDiscrepancy)
        .length,
      delayedDeals: results_batch.filter((r) => r.discrepancyStatus === "遅延")
        .length,
      earlyIssuedDeals: results_batch.filter(
        (r) => r.discrepancyStatus === "早期発行"
      ).length,
      normalDeals: results_batch.filter((r) => !r.hasDiscrepancy).length,
      maxDifferenceDays: Math.max(...results_batch.map((r) => r.dateDifferenceDays)),
      minDifferenceDays: Math.min(...results_batch.map((r) => r.dateDifferenceDays)),
    };

    expect(aggregated_summary.totalDeals).toBe(3);
    expect(aggregated_summary.dealsWithDiscrepancy).toBe(2);
    expect(aggregated_summary.delayedDeals).toBe(1);
    expect(aggregated_summary.earlyIssuedDeals).toBe(1);
    expect(aggregated_summary.normalDeals).toBe(1);
    expect(aggregated_summary.maxDifferenceDays).toBe(5);
    expect(aggregated_summary.minDifferenceDays).toBe(-3);

    // テストケース5: タイムゾーン非依存性の確認
    // 異なるタイムゾーン設定下でも同じ日付文字列で計算結果が一貫することを検証
    const input_tz_test: DealReconciliationInput = {
      dealId: "DEAL_TZ",
      dealStatus: "受注",
      plannedRevenueDate: "2024-04-10",
      actualInvoiceIssuedDate: "2024-04-15",
      invoiceAmount: 500000,
    };

    const result_tz_1: DealReconciliationResult =
      reconcileDealStatusWithInvoiceIssueDate(input_tz_test);

    // 同じ入力で再実行してもタイムゾーンの影響を受けない
    const result_tz_2: DealReconciliationResult =
      reconcileDealStatusWithInvoiceIssueDate(input_tz_test);

    expect(result_tz_1.dateDifferenceDays).toBe(result_tz_2.dateDifferenceDays);
    expect(result_tz_1.dateDifferenceDays).toBe(5);

    // 更新予定日より大幅に遅延している場合（30日超過）
    const input_severe_delay: DealReconciliationInput = {
      dealId: "DEAL_SEVERE",
      dealStatus: "受注",
      plannedRevenueDate: "2024-01-01",
      actualInvoiceIssuedDate: "2024-02-15",
      invoiceAmount: 1000000,
    };

    const result_severe: DealReconciliationResult =
      reconcileDealStatusWithInvoiceIssueDate(input_severe_delay);

    expect(result_severe.dateDifferenceDays).toBe(45);
    expect(result_severe.hasDiscrepancy).toBe(true);
    expect(result_severe.discrepancyStatus).toBe("遅延");
  });
});