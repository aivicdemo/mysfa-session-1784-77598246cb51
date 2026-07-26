import { classifyDealsByProgressStatus } from "../../src/logic/it-1";

describe("顧客別商談進捗分類機能", () => {
  // SCEN-118
  test("商談が5つの進捗ステータス別に正確に分類される", () => {
    const deals = [
      {
        dealId: "D001",
        customerId: "C001",
        dealName: "商談A",
        status: "初期接触",
        amount: 100000,
      },
      {
        dealId: "D002",
        customerId: "C001",
        dealName: "商談B",
        status: "提案済み",
        amount: 200000,
      },
      {
        dealId: "D003",
        customerId: "C001",
        dealName: "商談C",
        status: "交渉中",
        amount: 150000,
      },
      {
        dealId: "D004",
        customerId: "C001",
        dealName: "商談D",
        status: "契約予定",
        amount: 300000,
      },
      {
        dealId: "D005",
        customerId: "C001",
        dealName: "商談E",
        status: "成約",
        amount: 250000,
      },
      {
        dealId: "D006",
        customerId: "C001",
        dealName: "商談F",
        status: "初期接触",
        amount: 80000,
      },
      {
        dealId: "D007",
        customerId: "C001",
        dealName: "商談G",
        status: "提案済み",
        amount: 120000,
      },
    ];

    const result = classifyDealsByProgressStatus(deals, "C001");

    // 5つのステータスカテゴリが存在することを検証
    expect(Object.keys(result).sort()).toEqual([
      "交渉中",
      "初期接触",
      "提案済み",
      "成約",
      "契約予定",
    ]);

    // 初期接触: 2件
    expect(result["初期接触"].length).toBe(2);
    expect(result["初期接触"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: "D001",
          status: "初期接触",
          amount: 100000,
        }),
        expect.objectContaining({
          dealId: "D006",
          status: "初期接触",
          amount: 80000,
        }),
      ])
    );
    expect(result["初期接触"].every((d) => d.status === "初期接触")).toBe(
      true
    );

    // 提案済み: 2件
    expect(result["提案済み"].length).toBe(2);
    expect(result["提案済み"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          dealId: "D002",
          status: "提案済み",
          amount: 200000,
        }),
        expect.objectContaining({
          dealId: "D007",
          status: "提案済み",
          amount: 120000,
        }),
      ])
    );
    expect(result["提案済み"].every((d) => d.status === "提案済み")).toBe(
      true
    );

    // 交渉中: 1件
    expect(result["交渉中"].length).toBe(1);
    expect(result["交渉中"][0]).toEqual(
      expect.objectContaining({
        dealId: "D003",
        status: "交渉中",
        amount: 150000,
      })
    );

    // 契約予定: 1件
    expect(result["契約予定"].length).toBe(1);
    expect(result["契約予定"][0]).toEqual(
      expect.objectContaining({
        dealId: "D004",
        status: "契約予定",
        amount: 300000,
      })
    );

    // 成約: 1件
    expect(result["成約"].length).toBe(1);
    expect(result["成約"][0]).toEqual(
      expect.objectContaining({
        dealId: "D005",
        status: "成約",
        amount: 250000,
      })
    );

    // 各ステータスごとの合計金額を検証
    const initial_contact_total = result["初期接触"].reduce(
      (sum, d) => sum + d.amount,
      0
    );
    expect(initial_contact_total).toBe(180000);

    const proposal_total = result["提案済み"].reduce(
      (sum, d) => sum + d.amount,
      0
    );
    expect(proposal_total).toBe(320000);

    const negotiation_total = result["交渉中"].reduce(
      (sum, d) => sum + d.amount,
      0
    );
    expect(negotiation_total).toBe(150000);

    const contract_pending_total = result["契約予定"].reduce(
      (sum, d) => sum + d.amount,
      0
    );
    expect(contract_pending_total).toBe(300000);

    const closed_total = result["成約"].reduce(
      (sum, d) => sum + d.amount,
      0
    );
    expect(closed_total).toBe(250000);

    // 誤分類がないことを確認（すべての商談が正しいステータスに分類されている）
    const all_classified_deals = Object.values(result).flat();
    expect(all_classified_deals.length).toBe(7);
    expect(
      all_classified_deals.every((deal) =>
        ["初期接触", "提案済み", "交渉中", "契約予定", "成約"].includes(
          deal.status
        )
      )
    ).toBe(true);
  });
});