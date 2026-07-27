import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { reconcileInvoiceStatusWithDealStatus } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // SCEN-686
  test("月次決算期限3営業日前に照合開始時、遅延案件が1件の場合、その案件が検出結果に含まれる", () => {
    // テストデータ: 商談レコード
    const dealRecord = {
      deal_id: "DEAL-001",
      customer_name: "テスト顧客A",
      deal_status: "受注",
      contract_date: "2024-01-10",
      planned_invoice_date: "2024-02-15",
    };

    // テストデータ: 請求書レコード
    const invoiceRecord = {
      invoice_id: "INV-001",
      deal_id: "DEAL-001",
      invoice_status: "未発行",
      planned_invoice_date: "2024-02-15",
    };

    // システム設定: 月次決算期限
    const monthlyClosingDeadline = new Date("2024-03-01T00:00:00Z");

    // 現在日時を固定: 2024年2月26日（決算期限の3営業日前）
    const currentDate = new Date("2024-02-26T00:00:00Z");
    jest.setSystemTime(currentDate);

    // 照合・ズレ検出機能の実行
    const reconciliationResult = reconcileInvoiceStatusWithDealStatus(
      [dealRecord],
      [invoiceRecord],
      monthlyClosingDeadline,
      currentDate
    );

    // 期待結果: 遅延案件が1件検出される
    expect(reconciliationResult.delayed_deals).toHaveLength(1);

    // 期待結果: 検出された遅延案件の詳細
    const detectedDelayedDeal = reconciliationResult.delayed_deals[0];
    expect(detectedDelayedDeal.deal_id).toBe("DEAL-001");
    expect(detectedDelayedDeal.customer_name).toBe("テスト顧客A");
    expect(detectedDelayedDeal.deal_status).toBe("受注");
    expect(detectedDelayedDeal.invoice_id).toBe("INV-001");
    expect(detectedDelayedDeal.invoice_status).toBe("未発行");

    // 期待結果: ズレ内容の記録
    expect(detectedDelayedDeal.discrepancy_details).toMatch(
      /商談ステータス「受注」/
    );
    expect(detectedDelayedDeal.discrepancy_details).toMatch(/「未発行」/);
    expect(detectedDelayedDeal.discrepancy_details).toMatch(
      /決算期限3営業日前時点で請求書が未発行/
    );

    // 期待結果: 検出件数カウンター
    expect(reconciliationResult.delayed_deal_count).toBe(1);

    // 期待結果: 未請求案件は0件
    expect(reconciliationResult.unissued_deal_count).toBe(0);
  });
});