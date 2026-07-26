import { detectInvoiceDiscrepancies } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-173
  test("商談ステータスが『受注』でない場合、ズレ検出ロジックから除外される", () => {
    // Arrange: テストデータの準備
    // 商談ステータスが『提案中』で請求書が発行済みの商談
    const proposingDeal = {
      deal_id: "DEAL-001",
      status: "提案中",
      amount: 100000,
      invoice_issued_date: "2024-04-10",
      expected_invoice_date: "2024-04-15",
      customer_id: "CUST-A",
      customer_name: "顧客A",
    };

    // 商談ステータスが『失注』で請求書が発行済みの商談
    const lostDeal = {
      deal_id: "DEAL-002",
      status: "失注",
      amount: 50000,
      invoice_issued_date: "2024-04-12",
      expected_invoice_date: "2024-04-20",
      customer_id: "CUST-B",
      customer_name: "顧客B",
    };

    // 商談ステータスが『受注』で請求書が未発行の商談（対照として含める）
    const orderedDealUnbilled = {
      deal_id: "DEAL-003",
      status: "受注",
      amount: 150000,
      invoice_issued_date: null,
      expected_invoice_date: "2024-04-18",
      customer_id: "CUST-C",
      customer_name: "顧客C",
    };

    // 商談ステータスが『受注』で請求書が発行済みで期限を超過した商談
    const orderedDealOverdue = {
      deal_id: "DEAL-004",
      status: "受注",
      amount: 200000,
      invoice_issued_date: "2024-05-05",
      expected_invoice_date: "2024-04-25",
      customer_id: "CUST-D",
      customer_name: "顧客D",
    };

    const allDeals = [
      proposingDeal,
      lostDeal,
      orderedDealUnbilled,
      orderedDealOverdue,
    ];

    // Act: 自動照合・ズレ検出ロジックを実行
    const discrepancyResult = detectInvoiceDiscrepancies(allDeals);

    // Assert: 検出結果を検証
    // 期待結果：
    // 1. ステータスが『提案中』の DEAL-001 は検出対象から除外される
    // 2. ステータスが『失注』の DEAL-002 は検出対象から除外される
    // 3. ステータスが『受注』で請求書未発行の DEAL-003 は未請求案件として検出される
    // 4. ステータスが『受注』で請求書発行が期限超過の DEAL-004 は遅延案件として検出される

    // 検出対象外のディール（『提案中』『失注』）が結果に含まれていないことを確認
    const excludedDealIds = discrepancyResult.excluded_deals.map(
      (deal: any) => deal.deal_id
    );
    expect(excludedDealIds).toContain("DEAL-001");
    expect(excludedDealIds).toContain("DEAL-002");
    expect(excludedDealIds.length).toBe(2);

    // 検出対象のディール（『受注』のもの）のうち、未請求案件を確認
    const unbilledDealIds = discrepancyResult.unbilled_deals.map(
      (deal: any) => deal.deal_id
    );
    expect(unbilledDealIds).toContain("DEAL-003");

    // 検出対象のディール（『受注』のもの）のうち、遅延案件を確認
    const overdueInvoiceDealIds = discrepancyResult.overdue_invoice_deals.map(
      (deal: any) => deal.deal_id
    );
    expect(overdueInvoiceDealIds).toContain("DEAL-004");

    // 『提案中』『失注』のディールが検出結果（未請求、遅延）に含まれていないことを最終確認
    expect(unbilledDealIds).not.toContain("DEAL-001");
    expect(unbilledDealIds).not.toContain("DEAL-002");
    expect(overdueInvoiceDealIds).not.toContain("DEAL-001");
    expect(overdueInvoiceDealIds).not.toContain("DEAL-002");

    // 全体の検出統計を確認
    expect(discrepancyResult.total_excluded_count).toBe(2);
    expect(discrepancyResult.total_unbilled_count).toBe(1);
    expect(discrepancyResult.total_overdue_invoice_count).toBe(1);
  });
});