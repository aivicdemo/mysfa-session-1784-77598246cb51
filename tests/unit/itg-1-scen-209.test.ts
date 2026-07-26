import {
  detectUnbilledAndDelayedDeals,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-209: [normal] ステータスが『受注』でも請求書が発行済みの案件は未請求案件から除外される
  test("ステータスが『受注』で請求書発行済みの案件は未請求案件リストに表示されない", () => {
    // Arrange: テストデータの準備
    const dealA = {
      deal_id: "DEAL-001",
      customer_name: "顧客A",
      deal_status: "受注",
      deal_amount: 1000000,
      invoice_status: "発行済み",
      invoice_issued_date: "2024-04-10T09:00:00Z",
      scheduled_invoice_date: "2024-04-10T00:00:00Z",
    };

    const dealB = {
      deal_id: "DEAL-002",
      customer_name: "顧客B",
      deal_status: "受注",
      deal_amount: 500000,
      invoice_status: "未発行",
      invoice_issued_date: null,
      scheduled_invoice_date: "2024-04-15T00:00:00Z",
    };

    const dealC = {
      deal_id: "DEAL-003",
      customer_name: "顧客C",
      deal_status: "完了",
      deal_amount: 2000000,
      invoice_status: "発行済み",
      invoice_issued_date: "2024-04-12T14:30:00Z",
      scheduled_invoice_date: "2024-04-12T00:00:00Z",
    };

    const dealD = {
      deal_id: "DEAL-004",
      customer_name: "顧客D",
      deal_status: "受注",
      deal_amount: 750000,
      invoice_status: "未発行",
      invoice_issued_date: null,
      scheduled_invoice_date: "2024-04-05T00:00:00Z",
    };

    const deals = [dealA, dealB, dealC, dealD];
    const reference_date = new Date("2024-04-20T23:59:59Z");

    // Act: 自動照合・ズレ検出処理を実行
    const result = detectUnbilledAndDelayedDeals(deals, reference_date);

    // Assert: 期待値の検証
    // 未請求案件（invoice_status === "未発行" かつ deal_status === "受注"）: DEAL-002, DEAL-004
    expect(result.unbilled_deals.length).toBe(2);

    const unbilled_deal_ids = result.unbilled_deals.map(
      (deal: { deal_id: string }) => deal.deal_id
    );
    expect(unbilled_deal_ids).toContain("DEAL-002");
    expect(unbilled_deal_ids).toContain("DEAL-004");
    expect(unbilled_deal_ids).not.toContain("DEAL-001");
    expect(unbilled_deal_ids).not.toContain("DEAL-003");

    // 遅延案件（请求予定日を超過しているもの）: DEAL-004
    expect(result.delayed_deals.length).toBe(1);
    const delayed_deal_ids = result.delayed_deals.map(
      (deal: { deal_id: string }) => deal.deal_id
    );
    expect(delayed_deal_ids).toContain("DEAL-004");

    // DEAL-Aについて: ステータスが『受注』でも、請求書が『発行済み』なら未請求案件から除外される
    const deal_a_in_unbilled = result.unbilled_deals.some(
      (deal: { deal_id: string }) => deal.deal_id === "DEAL-001"
    );
    expect(deal_a_in_unbilled).toBe(false);

    // DEAL-Aについて: 遅延案件にも含まれないことを確認
    const deal_a_in_delayed = result.delayed_deals.some(
      (deal: { deal_id: string }) => deal.deal_id === "DEAL-001"
    );
    expect(deal_a_in_delayed).toBe(false);

    // システムログの検証: 自動照合・ズレ検出処理の実行が記録されていることを確認
    expect(result.system_log).toBeDefined();
    expect(result.system_log.process_type).toBe("自動照合・ズレ検出");
    expect(result.system_log.executed_at).toBeDefined();
    expect(result.system_log.deals_checked_count).toBe(4);
    expect(result.system_log.unbilled_count).toBe(2);
    expect(result.system_log.delayed_count).toBe(1);

    // 詳細な検証: 各案件のステータスと請求状況が正しく分類されていることを確認
    const deal_b = result.unbilled_deals.find(
      (deal: { deal_id: string }) => deal.deal_id === "DEAL-002"
    );
    expect(deal_b.deal_status).toBe("受注");
    expect(deal_b.invoice_status).toBe("未発行");
    expect(deal_b.deal_amount).toBe(500000);

    const deal_d = result.delayed_deals.find(
      (deal: { deal_id: string }) => deal.deal_id === "DEAL-004"
    );
    expect(deal_d.deal_status).toBe("受注");
    expect(deal_d.invoice_status).toBe("未発行");
    expect(deal_d.is_delayed).toBe(true);
    expect(deal_d.days_overdue).toBe(15);
  });
});