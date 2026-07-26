import { detectDelayedInvoicingCases } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-172
  test("請求日が売上計上予定日を30日以上超過している遅延案件が自動リスト化される", () => {
    // テスト用の商談データ: 31日超過（遅延案件として検出対象）
    const delayed_deal_1 = {
      deal_id: "DEAL-001",
      deal_name: "遅延案件1",
      customer_id: "CUST-001",
      customer_name: "顧客A",
      status: "成約",
      planned_revenue_date: new Date("2024-01-01"),
      invoice_issued_date: new Date("2024-02-01"),
      deal_amount: 1000000,
    };

    // テスト用の商談データ: 31日超過（遅延案件として検出対象）
    const delayed_deal_2 = {
      deal_id: "DEAL-002",
      deal_name: "遅延案件2",
      customer_id: "CUST-002",
      customer_name: "顧客B",
      status: "成約",
      planned_revenue_date: new Date("2024-01-01"),
      invoice_issued_date: new Date("2024-02-01"),
      deal_amount: 2000000,
    };

    // テスト用の比較用商談データ: 19日超過（遅延案件として検出対象外）
    const non_delayed_deal = {
      deal_id: "DEAL-003",
      deal_name: "非遅延案件",
      customer_id: "CUST-003",
      customer_name: "顧客C",
      status: "成約",
      planned_revenue_date: new Date("2024-01-01"),
      invoice_issued_date: new Date("2024-01-20"),
      deal_amount: 500000,
    };

    // テスト入力: 複数の商談レコード
    const deals = [delayed_deal_1, delayed_deal_2, non_delayed_deal];

    // 遅延案件検出機能を実行
    const result = detectDelayedInvoicingCases(deals);

    // 期待値: 30日以上超過している案件のみが検出される
    expect(result.delayed_cases.length).toBe(2);
    expect(result.delayed_cases).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deal_id: "DEAL-001",
          deal_name: "遅延案件1",
          customer_name: "顧客A",
          status: "成約",
          planned_revenue_date: new Date("2024-01-01"),
          invoice_issued_date: new Date("2024-02-01"),
          days_delayed: 31,
        }),
        expect.objectContaining({
          deal_id: "DEAL-002",
          deal_name: "遅延案件2",
          customer_name: "顧客B",
          status: "成約",
          planned_revenue_date: new Date("2024-01-01"),
          invoice_issued_date: new Date("2024-02-01"),
          days_delayed: 31,
        }),
      ])
    );

    // 30日未満の超過案件が含まれていないことを確認
    expect(result.delayed_cases).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deal_id: "DEAL-003",
        }),
      ])
    );

    // 非遅延案件リストに含まれていることを確認
    expect(result.non_delayed_cases.length).toBe(1);
    expect(result.non_delayed_cases[0]).toEqual(
      expect.objectContaining({
        deal_id: "DEAL-003",
        deal_name: "非遅延案件",
        customer_name: "顧客C",
        status: "成約",
        days_delayed: 19,
      })
    );

    // 遅延案件の詳細情報が正確に表示されているか確認
    const first_delayed_case = result.delayed_cases[0];
    expect(first_delayed_case.days_delayed).toBeGreaterThanOrEqual(30);
    expect(first_delayed_case.deal_amount).toBe(1000000);

    const second_delayed_case = result.delayed_cases[1];
    expect(second_delayed_case.days_delayed).toBeGreaterThanOrEqual(30);
    expect(second_delayed_case.deal_amount).toBe(2000000);

    // 遅延案件の件数が期待値と一致していることを確認
    expect(result.delayed_cases.length).toBe(2);
    expect(result.total_delayed_count).toBe(2);
  });
});