import { detectUnbilledDeals } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-108
  test("未請求案件自動検出機能 - 商談ステータスが受注でも請求発行予定日が未設定の場合、検出対象から除外される", () => {
    const deals = [
      {
        deal_id: "D001",
        status: "受注",
        invoice_scheduled_date: null,
        customer_name: "顧客A",
        amount: 100000,
      },
      {
        deal_id: "D002",
        status: "受注",
        invoice_scheduled_date: "2024-02-15",
        customer_name: "顧客B",
        amount: 150000,
      },
      {
        deal_id: "D003",
        status: "成約",
        invoice_scheduled_date: "2024-02-20",
        customer_name: "顧客C",
        amount: 200000,
      },
      {
        deal_id: "D004",
        status: "受注",
        invoice_scheduled_date: null,
        customer_name: "顧客D",
        amount: 75000,
      },
    ];

    const result = detectUnbilledDeals(deals);

    expect(result).toEqual([
      {
        deal_id: "D002",
        status: "受注",
        invoice_scheduled_date: "2024-02-15",
        customer_name: "顧客B",
        amount: 150000,
      },
    ]);

    expect(result.length).toBe(1);
    expect(result.some((d) => d.deal_id === "D001")).toBe(false);
    expect(result.some((d) => d.deal_id === "D004")).toBe(false);
    expect(result[0].invoice_scheduled_date).not.toBeNull();
  });
});