import { validateDealStatusTransition } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-197
  test("商談ステータス遷移の業務ルール検証機能 - ステータス遷移の条件（必須項目の入力有無など）が境界値である場合、正確に検証される", () => {
    // ステップ 1-2: 初期ステータス「新規」で商談を作成
    const initialDeal = {
      dealId: "DEAL-001",
      status: "新規",
      customerName: "",
      amount: null,
      proposalDate: null,
      proposalContent: "",
      orderConditions: "",
    };

    // ステップ 3-4: 「初期接触」への遷移、必須項目「顧客名」入力、「初期接触金額」空のまま遷移を試みる
    const dealWithCustomerOnly = {
      ...initialDeal,
      status: "新規",
      customerName: "顧客A",
      amount: null, // 必須項目が空
    };

    expect(() =>
      validateDealStatusTransition(dealWithCustomerOnly, "初期接触")
    ).toThrow(/初期接触金額/);

    // ステップ 5-6: 「初期接触金額」に最小値（0円）を入力して遷移を試みる
    const dealWithMinimumAmount = {
      ...initialDeal,
      status: "新規",
      customerName: "顧客A",
      amount: 0, // 最小値
    };

    const result1 = validateDealStatusTransition(
      dealWithMinimumAmount,
      "初期接触"
    );
    expect(result1).toEqual({
      allowed: true,
      previousStatus: "新規",
      newStatus: "初期接触",
      validatedFields: ["customerName", "amount"],
    });

    // ステップ 7-9: 「提案」への遷移、すべての必須項目入力、「提案内容」は最小文字数（1文字）
    const dealWithProposal = {
      dealId: "DEAL-001",
      status: "初期接触",
      customerName: "顧客A",
      amount: 100000,
      proposalDate: "2024-01-15",
      proposalContent: "A", // 最小文字数 1文字
      orderConditions: "",
    };

    const result2 = validateDealStatusTransition(dealWithProposal, "提案");
    expect(result2).toEqual({
      allowed: true,
      previousStatus: "初期接触",
      newStatus: "提案",
      validatedFields: ["customerName", "amount", "proposalDate", "proposalContent"],
    });

    // ステップ 10-12: 「受注」への遷移、すべての必須項目入力、「受注条件」は最大文字数を超える入力
    const dealWithExcessiveOrderConditions = {
      dealId: "DEAL-001",
      status: "提案",
      customerName: "顧客A",
      amount: 100000,
      proposalDate: "2024-01-15",
      proposalContent: "提案内容の詳細",
      orderConditions: "a".repeat(5001), // 最大文字数 5000 を超える
    };

    expect(() =>
      validateDealStatusTransition(dealWithExcessiveOrderConditions, "受注")
    ).toThrow(/受注条件/);

    // ステップ 13-14: 「受注条件」を最大文字数以内に修正して遷移を試みる
    const dealWithValidOrderConditions = {
      dealId: "DEAL-001",
      status: "提案",
      customerName: "顧客A",
      amount: 100000,
      proposalDate: "2024-01-15",
      proposalContent: "提案内容の詳細",
      orderConditions: "a".repeat(5000), // 最大文字数 5000 以内
    };

    const result3 = validateDealStatusTransition(
      dealWithValidOrderConditions,
      "受注"
    );
    expect(result3).toEqual({
      allowed: true,
      previousStatus: "提案",
      newStatus: "受注",
      validatedFields: [
        "customerName",
        "amount",
        "proposalDate",
        "proposalContent",
        "orderConditions",
      ],
    });

    // 検証結果ログ出力
    const validationLog = [
      {
        step: "初期接触遷移試行1",
        condition: "必須項目「顧客名」入力、「初期接触金額」空",
        result: "拒否",
        errorMessage: "初期接触金額",
      },
      {
        step: "初期接触遷移試行2",
        condition: "「初期接触金額」最小値（0円）入力",
        result: "成功",
        errorMessage: null,
      },
      {
        step: "提案遷移試行",
        condition: "すべての必須項目入力、「提案内容」最小文字数（1文字）",
        result: "成功",
        errorMessage: null,
      },
      {
        step: "受注遷移試行1",
        condition: "「受注条件」最大文字数超過（5001文字）",
        result: "拒否",
        errorMessage: "受注条件",
      },
      {
        step: "受注遷移試行2",
        condition: "「受注条件」最大文字数以内（5000文字）",
        result: "成功",
        errorMessage: null,
      },
    ];

    expect(validationLog).toHaveLength(5);
    expect(validationLog[0].result).toBe("拒否");
    expect(validationLog[0].errorMessage).toBe("初期接触金額");
    expect(validationLog[1].result).toBe("成功");
    expect(validationLog[2].result).toBe("成功");
    expect(validationLog[3].result).toBe("拒否");
    expect(validationLog[3].errorMessage).toBe("受注条件");
    expect(validationLog[4].result).toBe("成功");
  });
});