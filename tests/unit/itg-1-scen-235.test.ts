import { validateDealStatusTransition } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-235: [edge] 商談ステータス遷移検証機能 - ステータス遷移の境界ケース：同じステータスへの遷移が正しく処理される
  test("同じステータスへの遷移が正常に処理され、ステータス変更履歴に記録される", () => {
    // 前提: 既存の商談レコードが営業管理システムに存在し、現在のステータスが「交渉中」の状態
    const dealRecord = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      dealName: "A社との商談",
      currentStatus: "交渉中",
      amount: 500000,
      createdAt: new Date("2024-01-15T10:00:00Z"),
    };

    const statusHistoryBefore: Array<{
      dealId: string;
      fromStatus: string;
      toStatus: string;
      changedAt: Date;
    }> = [
      {
        dealId: "DEAL-001",
        fromStatus: "初期接触",
        toStatus: "提案中",
        changedAt: new Date("2024-01-10T14:00:00Z"),
      },
      {
        dealId: "DEAL-001",
        fromStatus: "提案中",
        toStatus: "交渉中",
        changedAt: new Date("2024-01-12T09:30:00Z"),
      },
    ];

    // 発生条件: 営業担当者が商談の現在のステータス「交渉中」と同じステータスへの遷移を実行
    const transitionRequest = {
      dealId: "DEAL-001",
      currentStatus: "交渉中",
      newStatus: "交渉中",
      transitionTime: new Date("2024-01-15T11:00:00Z"),
      operatorId: "USER-001",
    };

    // 実行
    const result = validateDealStatusTransition(transitionRequest);

    // 期待結果: 同じステータスへの遷移が正常に処理される
    expect(result.isValid).toBe(true);

    // 期待結果: ステータスは変わらず「交渉中」のままであることを確認
    expect(result.dealStatus).toBe("交渉中");

    // 期待結果: ステータス変更履歴にこの遷移イベントが記録されることを確認
    expect(result.statusHistoryRecord).toEqual({
      dealId: "DEAL-001",
      fromStatus: "交渉中",
      toStatus: "交渉中",
      changedAt: new Date("2024-01-15T11:00:00Z"),
      operatorId: "USER-001",
      isNoChange: true,
    });

    // 期待結果: システムエラーが発生していないことを検証
    expect(result.errorFlag).toBe(false);
    expect(result.errorMessage).toBeUndefined();

    // 期待結果: トランザクション状態が正常に完了したことを確認
    expect(result.transactionStatus).toBe("completed");
  });

  test("異なるステータスへの遷移は正常に処理される", () => {
    // 前提: 既存の商談レコードが営業管理システムに存在し、現在のステータスが「交渉中」
    const transitionRequest = {
      dealId: "DEAL-002",
      currentStatus: "交渉中",
      newStatus: "受注",
      transitionTime: new Date("2024-01-15T15:00:00Z"),
      operatorId: "USER-002",
    };

    // 実行
    const result = validateDealStatusTransition(transitionRequest);

    // 期待結果: 異なるステータスへの遷移が正常に処理される
    expect(result.isValid).toBe(true);

    // 期待結果: ステータスが「受注」に更新される
    expect(result.dealStatus).toBe("受注");

    // 期待結果: ステータス変更履歴に遷移が記録される
    expect(result.statusHistoryRecord.fromStatus).toBe("交渉中");
    expect(result.statusHistoryRecord.toStatus).toBe("受注");
    expect(result.statusHistoryRecord.isNoChange).toBe(false);

    // 期待結果: エラーが発生していない
    expect(result.errorFlag).toBe(false);

    // 期待結果: トランザクション状態が正常に完了
    expect(result.transactionStatus).toBe("completed");
  });

  test("不正なステータス遷移は拒否される", () => {
    // 前提: 不正な遷移ルール違反のステータス値
    const transitionRequest = {
      dealId: "DEAL-003",
      currentStatus: "受注",
      newStatus: "初期接触",
      transitionTime: new Date("2024-01-15T16:00:00Z"),
      operatorId: "USER-003",
    };

    // 実行: 不正な遷移が拒否されることを検証
    expect(() => validateDealStatusTransition(transitionRequest)).toThrow(
      /ステータス遷移/
    );
  });

  test("必須項目が不足している場合はエラーが発生する", () => {
    // 前提: 必須項目が不足しているリクエスト
    const invalidTransitionRequest = {
      dealId: "DEAL-004",
      currentStatus: "交渉中",
      // newStatus が不足
      transitionTime: new Date("2024-01-15T17:00:00Z"),
    };

    // 実行: 必須項目不足でエラーが発生することを検証
    expect(() =>
      validateDealStatusTransition(invalidTransitionRequest as any)
    ).toThrow(/必須項目/);
  });
});