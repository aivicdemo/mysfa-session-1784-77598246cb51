import { determineBillingExecutionTiming } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 商談情報参照機能", () => {
  // SCEN-094
  test("請求実行タイミング判定機能 - 請求タイプ『納期後』『カスタム』の商談レコードが各々の判定ロジックで正確に抽出される", () => {
    // テストデータ: 請求タイプ『納期後』の商談レコード
    const deal001 = {
      dealId: "DEAL-001",
      billingType: "納期後",
      deliveryDate: "2024-01-15",
      customBillingDate: null,
      status: "受注",
    };

    // テストデータ: 請求タイプ『カスタム』の商談レコード
    const deal002 = {
      dealId: "DEAL-002",
      billingType: "カスタム",
      deliveryDate: "2024-01-20",
      customBillingDate: "2024-02-10",
      status: "受注",
    };

    // テストデータ: 請求タイプがその他の商談レコード
    const deal003 = {
      dealId: "DEAL-003",
      billingType: "月次",
      deliveryDate: "2024-01-25",
      customBillingDate: null,
      status: "受注",
    };

    const deals = [deal001, deal002, deal003];

    // 請求実行タイミング判定機能を実行
    const result = determineBillingExecutionTiming(deals);

    // 『納期後』の判定ロジックが適用され、商談ID: DEAL-001が正確に抽出されたことを確認
    expect(result.afterDelivery).toEqual([deal001]);
    expect(result.afterDelivery[0].dealId).toBe("DEAL-001");
    expect(result.afterDelivery[0].billingType).toBe("納期後");

    // 『カスタム』の判定ロジックが適用され、商談ID: DEAL-002が正確に抽出されたことを確認
    expect(result.custom).toEqual([deal002]);
    expect(result.custom[0].dealId).toBe("DEAL-002");
    expect(result.custom[0].billingType).toBe("カスタム");
    expect(result.custom[0].customBillingDate).toBe("2024-02-10");

    // 請求タイプがその他の商談ID: DEAL-003が抽出されていないことを確認
    expect(result.afterDelivery).not.toContainEqual(deal003);
    expect(result.custom).not.toContainEqual(deal003);

    // 抽出された各商談レコードの属性値が正確であることを検証
    expect(result.afterDelivery.length).toBe(1);
    expect(result.custom.length).toBe(1);
    expect(result.afterDelivery[0].status).toBe("受注");
    expect(result.custom[0].status).toBe("受注");
    expect(result.custom[0].deliveryDate).toBe("2024-01-20");
  });
});