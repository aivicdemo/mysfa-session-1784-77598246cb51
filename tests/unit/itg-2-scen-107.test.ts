import { detectUnbilledAndDelayedDeals } from "../../src/logic/it-1784969823049-2-1-2";

describe("未請求案件自動検出機能", () => {
  test("SCEN-107: 請求実行タイミング到達時に未請求案件と遅延案件が正確に検出される", () => {
    // Arrange: テスト環境で複数の案件を作成
    const today = new Date("2024-12-15");
    const unbilledDeadlineDate1 = new Date("2024-12-15"); // 本日
    const unbilledDeadlineDate2 = new Date("2024-12-14"); // 1日前
    const unbilledDeadlineDate3 = new Date("2024-12-10"); // 5日前
    const delayedDeadlineDate1 = new Date("2024-11-15"); // 30日前
    const delayedDeadlineDate2 = new Date("2024-10-01"); // 75日前

    const dealsInput = [
      {
        deal_id: "DEAL001",
        customer_name: "顧客A",
        deal_amount: 500000,
        status: "受注",
        billing_scheduled_date: unbilledDeadlineDate1,
        billing_issued_date: null,
        billing_type: "月次",
      },
      {
        deal_id: "DEAL002",
        customer_name: "顧客B",
        deal_amount: 300000,
        status: "受注",
        billing_scheduled_date: unbilledDeadlineDate2,
        billing_issued_date: null,
        billing_type: "月次",
      },
      {
        deal_id: "DEAL003",
        customer_name: "顧客C",
        deal_amount: 200000,
        status: "受注",
        billing_scheduled_date: unbilledDeadlineDate3,
        billing_issued_date: null,
        billing_type: "納期後",
      },
      {
        deal_id: "DEAL004",
        customer_name: "顧客D",
        deal_amount: 1000000,
        status: "受注",
        billing_scheduled_date: delayedDeadlineDate1,
        billing_issued_date: null,
        billing_type: "月次",
      },
      {
        deal_id: "DEAL005",
        customer_name: "顧客E",
        deal_amount: 750000,
        status: "受注",
        billing_scheduled_date: delayedDeadlineDate2,
        billing_issued_date: null,
        billing_type: "月次",
      },
    ];

    // Act: 未請求案件自動検出機能を実行
    const detectionResult = detectUnbilledAndDelayedDeals(dealsInput, today);

    // Assert: 未請求案件が正確に検出されている
    expect(detectionResult.unbilled_deals.length).toBe(3);
    expect(detectionResult.unbilled_deals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deal_id: "DEAL001",
          customer_name: "顧客A",
          deal_amount: 500000,
          status: "受注",
          billing_scheduled_date: unbilledDeadlineDate1,
          is_delayed: false,
        }),
        expect.objectContaining({
          deal_id: "DEAL002",
          customer_name: "顧客B",
          deal_amount: 300000,
          status: "受注",
          billing_scheduled_date: unbilledDeadlineDate2,
          is_delayed: false,
        }),
        expect.objectContaining({
          deal_id: "DEAL003",
          customer_name: "顧客C",
          deal_amount: 200000,
          status: "受注",
          billing_scheduled_date: unbilledDeadlineDate3,
          is_delayed: false,
        }),
      ])
    );

    // Assert: 遅延案件が正確に検出されている
    expect(detectionResult.delayed_deals.length).toBe(2);
    expect(detectionResult.delayed_deals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deal_id: "DEAL004",
          customer_name: "顧客D",
          deal_amount: 1000000,
          status: "受注",
          billing_scheduled_date: delayedDeadlineDate1,
          is_delayed: true,
        }),
        expect.objectContaining({
          deal_id: "DEAL005",
          customer_name: "顧客E",
          deal_amount: 750000,
          status: "受注",
          billing_scheduled_date: delayedDeadlineDate2,
          is_delayed: true,
        }),
      ])
    );

    // Assert: 全検出案件数が正確
    expect(detectionResult.unbilled_deals.length + detectionResult.delayed_deals.length).toBe(5);

    // Assert: 各遅延案件のフラグが付与されている
    detectionResult.delayed_deals.forEach((delayed_deal) => {
      expect(delayed_deal.is_delayed).toBe(true);
    });

    // Assert: 各未請求案件にはフラグが付与されていない
    detectionResult.unbilled_deals.forEach((unbilled_deal) => {
      expect(unbilled_deal.is_delayed).toBe(false);
    });

    // Assert: 検出漏れがない（すべての受注ステータス案件が何らかのリストに含まれている）
    const detected_deal_ids = [
      ...detectionResult.unbilled_deals.map((d) => d.deal_id),
      ...detectionResult.delayed_deals.map((d) => d.deal_id),
    ];
    expect(detected_deal_ids.sort()).toEqual([
      "DEAL001",
      "DEAL002",
      "DEAL003",
      "DEAL004",
      "DEAL005",
    ]);

    // Assert: 金額の集計が正確
    const unbilled_total_amount = detectionResult.unbilled_deals.reduce(
      (sum, deal) => sum + deal.deal_amount,
      0
    );
    expect(unbilled_total_amount).toBe(1000000); // 500000 + 300000 + 200000

    const delayed_total_amount = detectionResult.delayed_deals.reduce(
      (sum, deal) => sum + deal.deal_amount,
      0
    );
    expect(delayed_total_amount).toBe(1750000); // 1000000 + 750000
  });
});