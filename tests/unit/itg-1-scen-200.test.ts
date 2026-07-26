import { determineBillingType, extractBillingTargetDeals } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-200: 請求タイプ判定と請求対象商談の自動抽出機能 - 月次請求処理の自動実行スケジュール発動時に、請求対象が正確に確定される
  test("月次請求処理スケジュール発動時に請求タイプ判定と請求対象商談が正確に抽出される", () => {
    // Arrange: テストデータセットアップ
    const deals = [
      {
        dealId: "DEAL001",
        customerId: "CUST001",
        dealName: "顧客A_案件1",
        status: "受注",
        amount: 100000,
        billingType: "月次",
        billingExcludeFlag: false,
        contractDate: "2024-01-15",
      },
      {
        dealId: "DEAL002",
        customerId: "CUST001",
        dealName: "顧客A_案件2",
        status: "受注",
        amount: 50000,
        billingType: "単発",
        billingExcludeFlag: false,
        contractDate: "2024-01-20",
      },
      {
        dealId: "DEAL003",
        customerId: "CUST002",
        dealName: "顧客B_案件1",
        status: "完了",
        amount: 200000,
        billingType: "月次",
        billingExcludeFlag: false,
        contractDate: "2023-12-01",
      },
      {
        dealId: "DEAL004",
        customerId: "CUST002",
        dealName: "顧客B_案件2",
        status: "提案中",
        amount: 75000,
        billingType: "月次",
        billingExcludeFlag: false,
        contractDate: "2024-02-01",
      },
      {
        dealId: "DEAL005",
        customerId: "CUST003",
        dealName: "顧客C_案件1",
        status: "受注",
        amount: 300000,
        billingType: "前払い",
        billingExcludeFlag: false,
        contractDate: "2024-01-10",
      },
      {
        dealId: "DEAL006",
        customerId: "CUST003",
        dealName: "顧客C_案件2",
        status: "受注",
        amount: 120000,
        billingType: "月次",
        billingExcludeFlag: true,
        contractDate: "2024-01-25",
      },
      {
        dealId: "DEAL007",
        customerId: "CUST004",
        dealName: "顧客D_案件1",
        status: "失注",
        amount: 80000,
        billingType: "月次",
        billingExcludeFlag: false,
        contractDate: "2024-02-05",
      },
    ];

    const billingExecutionDate = "2024-02-01";
    const billingTypeConfig = {
      月次: { name: "月次", executionDay: 1 },
      単発: { name: "単発", executionDay: null },
      前払い: { name: "前払い", executionDay: null },
    };

    // Act: 請求タイプ判定と請求対象商談の抽出実行
    const extractedDeals = extractBillingTargetDeals(
      deals,
      billingExecutionDate,
      billingTypeConfig
    );

    // Assert: 抽出結果の検証
    // 条件: status が '受注' または '完了' かつ billingExcludeFlag が false
    expect(extractedDeals).toHaveLength(4);

    // 抽出対象:
    // DEAL001: status='受注', billingType='月次', excludeFlag=false ✓
    // DEAL002: status='受注', billingType='単発', excludeFlag=false ✓
    // DEAL003: status='完了', billingType='月次', excludeFlag=false ✓
    // DEAL005: status='受注', billingType='前払い', excludeFlag=false ✓

    // 除外対象:
    // DEAL004: status='提案中' (ステータス不適合)
    // DEAL006: billingExcludeFlag=true (除外フラグ設定)
    // DEAL007: status='失注' (ステータス不適合)

    const dealIds = extractedDeals.map((d) => d.dealId).sort();
    expect(dealIds).toEqual(["DEAL001", "DEAL002", "DEAL003", "DEAL005"]);

    // 抽出された各商談の詳細検証
    const deal001 = extractedDeals.find((d) => d.dealId === "DEAL001");
    expect(deal001).toEqual({
      dealId: "DEAL001",
      customerId: "CUST001",
      dealName: "顧客A_案件1",
      status: "受注",
      amount: 100000,
      billingType: "月次",
      billingExcludeFlag: false,
      contractDate: "2024-01-15",
    });

    const deal002 = extractedDeals.find((d) => d.dealId === "DEAL002");
    expect(deal002).toEqual({
      dealId: "DEAL002",
      customerId: "CUST001",
      dealName: "顧客A_案件2",
      status: "受注",
      amount: 50000,
      billingType: "単発",
      billingExcludeFlag: false,
      contractDate: "2024-01-20",
    });

    const deal003 = extractedDeals.find((d) => d.dealId === "DEAL003");
    expect(deal003).toEqual({
      dealId: "DEAL003",
      customerId: "CUST002",
      dealName: "顧客B_案件1",
      status: "完了",
      amount: 200000,
      billingType: "月次",
      billingExcludeFlag: false,
      contractDate: "2023-12-01",
    });

    const deal005 = extractedDeals.find((d) => d.dealId === "DEAL005");
    expect(deal005).toEqual({
      dealId: "DEAL005",
      customerId: "CUST003",
      dealName: "顧客C_案件1",
      status: "受注",
      amount: 300000,
      billingType: "前払い",
      billingExcludeFlag: false,
      contractDate: "2024-01-10",
    });

    // 請求タイプ判定結果の検証
    const monthlyBillingType = determineBillingType("月次");
    expect(monthlyBillingType).toBe("月次");

    const spotBillingType = determineBillingType("単発");
    expect(spotBillingType).toBe("単発");

    const advanceBillingType = determineBillingType("前払い");
    expect(advanceBillingType).toBe("前払い");

    // 不正な請求タイプの検証（エラーケース）
    expect(() => determineBillingType("不正な型")).toThrow(/請求タイプ/);

    // 除外フラグが true の場合、抽出対象から除外されることを確認
    const excludedDeal = deals.find((d) => d.dealId === "DEAL006");
    expect(extractedDeals).not.toContainEqual(excludedDeal);

    // ステータスが不適合な案件が除外されることを確認
    const inappropriateDeal = deals.find((d) => d.dealId === "DEAL004");
    expect(extractedDeals).not.toContainEqual(inappropriateDeal);

    const rejectedDeal = deals.find((d) => d.dealId === "DEAL007");
    expect(extractedDeals).not.toContainEqual(rejectedDeal);
  });
});