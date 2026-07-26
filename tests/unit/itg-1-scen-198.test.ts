import { determineBillingType, extractBillingTargetDeals } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-198
  test("請求タイプ判定と請求対象商談の自動抽出機能 - 請求タイプが正確に判定され、対応する商談が抽出される", () => {
    // 複数の商談データを準備
    const monthlyDeal = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      dealAmount: 100000,
      billingType: "monthly",
      dealStatus: "won",
      dealDate: new Date("2024-01-15T09:00:00Z"),
      deliveryDate: new Date("2024-02-15T00:00:00Z"),
    };

    const afterDeliveryDeal = {
      dealId: "DEAL-002",
      customerId: "CUST-002",
      dealAmount: 250000,
      billingType: "after_delivery",
      dealStatus: "won",
      dealDate: new Date("2024-01-20T10:30:00Z"),
      deliveryDate: new Date("2024-01-31T00:00:00Z"),
    };

    const customDeal = {
      dealId: "DEAL-003",
      customerId: "CUST-003",
      dealAmount: 180000,
      billingType: "custom",
      dealStatus: "won",
      dealDate: new Date("2024-01-25T14:15:00Z"),
      deliveryDate: new Date("2024-03-10T00:00:00Z"),
    };

    // ステップ 1: 月次契約の商談を選択して請求タイプ判定機能を実行
    const monthlyBillingType = determineBillingType(monthlyDeal);
    expect(monthlyBillingType).toBe("monthly");

    // ステップ 2: 納期後契約の商談を選択して請求タイプ判定機能を実行
    const afterDeliveryBillingType = determineBillingType(afterDeliveryDeal);
    expect(afterDeliveryBillingType).toBe("after_delivery");

    // ステップ 3: カスタム契約の商談を選択して請求タイプ判定機能を実行
    const customBillingType = determineBillingType(customDeal);
    expect(customBillingType).toBe("custom");

    // 各請求タイプに対応する請求対象商談が自動抽出される
    const allDeals = [monthlyDeal, afterDeliveryDeal, customDeal];

    // ステップ 4-5: 月次タイプの請求対象商談を抽出
    const monthlyExtracted = extractBillingTargetDeals(allDeals, "monthly");
    expect(monthlyExtracted).toHaveLength(1);
    expect(monthlyExtracted[0].dealId).toBe("DEAL-001");
    expect(monthlyExtracted[0].dealAmount).toBe(100000);
    expect(monthlyExtracted[0].billingType).toBe("monthly");
    expect(monthlyExtracted[0].dealStatus).toBe("won");

    // ステップ 6-7: 納期後タイプの請求対象商談を抽出
    const afterDeliveryExtracted = extractBillingTargetDeals(
      allDeals,
      "after_delivery"
    );
    expect(afterDeliveryExtracted).toHaveLength(1);
    expect(afterDeliveryExtracted[0].dealId).toBe("DEAL-002");
    expect(afterDeliveryExtracted[0].dealAmount).toBe(250000);
    expect(afterDeliveryExtracted[0].billingType).toBe("after_delivery");
    expect(afterDeliveryExtracted[0].dealStatus).toBe("won");

    // ステップ 8-9: カスタムタイプの請求対象商談を抽出
    const customExtracted = extractBillingTargetDeals(allDeals, "custom");
    expect(customExtracted).toHaveLength(1);
    expect(customExtracted[0].dealId).toBe("DEAL-003");
    expect(customExtracted[0].dealAmount).toBe(180000);
    expect(customExtracted[0].billingType).toBe("custom");
    expect(customExtracted[0].dealStatus).toBe("won");

    // ステップ 10: 抽出された商談データが正確であることを検証
    // 月次抽出の詳細検証
    expect(monthlyExtracted[0].customerId).toBe("CUST-001");
    expect(monthlyExtracted[0].deliveryDate).toEqual(
      new Date("2024-02-15T00:00:00Z")
    );

    // 納期後抽出の詳細検証
    expect(afterDeliveryExtracted[0].customerId).toBe("CUST-002");
    expect(afterDeliveryExtracted[0].deliveryDate).toEqual(
      new Date("2024-01-31T00:00:00Z")
    );

    // カスタム抽出の詳細検証
    expect(customExtracted[0].customerId).toBe("CUST-003");
    expect(customExtracted[0].deliveryDate).toEqual(
      new Date("2024-03-10T00:00:00Z")
    );

    // 複数タイプ混在時の正確性確認
    const monthlyCount = allDeals.filter(
      (d) => determineBillingType(d) === "monthly"
    ).length;
    const afterDeliveryCount = allDeals.filter(
      (d) => determineBillingType(d) === "after_delivery"
    ).length;
    const customCount = allDeals.filter(
      (d) => determineBillingType(d) === "custom"
    ).length;

    expect(monthlyCount).toBe(1);
    expect(afterDeliveryCount).toBe(1);
    expect(customCount).toBe(1);
  });
});