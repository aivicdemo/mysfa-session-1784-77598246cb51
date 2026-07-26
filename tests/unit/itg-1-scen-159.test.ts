import { aggregateUnbilledAmountsForMonthlyClosing } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-159
  test("月次決算対象期間内に未請求案件が存在する場合、未請求額が正しく抽出される", () => {
    const deal_A = {
      deal_id: "DEAL-001",
      customer_name: "顧客A",
      deal_amount: 100000,
      deal_status: "受注",
      invoice_issued_date: null,
      deal_created_date: new Date("2024-01-15"),
    };

    const deal_B = {
      deal_id: "DEAL-002",
      customer_name: "顧客B",
      deal_amount: 250000,
      deal_status: "受注",
      invoice_issued_date: null,
      deal_created_date: new Date("2024-01-20"),
    };

    const deal_C = {
      deal_id: "DEAL-003",
      customer_name: "顧客C",
      deal_amount: 75000,
      deal_status: "受注",
      invoice_issued_date: null,
      deal_created_date: new Date("2024-01-25"),
    };

    const deals = [deal_A, deal_B, deal_C];
    const period_start = new Date("2024-01-01");
    const period_end = new Date("2024-01-31");

    const result = aggregateUnbilledAmountsForMonthlyClosing(deals, period_start, period_end);

    expect(result.total_unbilled_amount).toBe(425000);
    expect(result.unbilled_count).toBe(3);
    expect(result.unbilled_deals).toEqual([
      {
        deal_id: "DEAL-001",
        customer_name: "顧客A",
        unbilled_amount: 100000,
      },
      {
        deal_id: "DEAL-002",
        customer_name: "顧客B",
        unbilled_amount: 250000,
      },
      {
        deal_id: "DEAL-003",
        customer_name: "顧客C",
        unbilled_amount: 75000,
      },
    ]);
    expect(result.export_data).toEqual({
      period: "2024-01-01 to 2024-01-31",
      total_unbilled_amount: 425000,
      unbilled_count: 3,
      details: [
        {
          deal_id: "DEAL-001",
          customer_name: "顧客A",
          unbilled_amount: 100000,
        },
        {
          deal_id: "DEAL-002",
          customer_name: "顧客B",
          unbilled_amount: 250000,
        },
        {
          deal_id: "DEAL-003",
          customer_name: "顧客C",
          unbilled_amount: 75000,
        },
      ],
    });
  });
});