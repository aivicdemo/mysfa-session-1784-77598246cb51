import { recordDealStatusTransition, getDealStatusHistory } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談ステータス遷移検証機能", () => {
  // SCEN-754
  test("ステータス遷移履歴が記録される場合、遷移の順序が正確に保持される", () => {
    const dealId = "deal-20240115-001";
    const customerId = "customer-12345";

    // タイムスタンプを固定値で定義（時系列順）
    const timestamp1 = new Date("2024-01-15T09:00:00Z");
    const timestamp2 = new Date("2024-01-15T10:30:00Z");
    const timestamp3 = new Date("2024-01-15T12:00:00Z");
    const timestamp4 = new Date("2024-01-15T14:15:00Z");

    // ステップ1: 初期ステータス「リード」→「初期接触」に遷移
    recordDealStatusTransition({
      dealId,
      customerId,
      fromStatus: "リード",
      toStatus: "初期接触",
      transitionTimestamp: timestamp1,
    });

    // ステップ2: 「初期接触」→「提案」に遷移
    recordDealStatusTransition({
      dealId,
      customerId,
      fromStatus: "初期接触",
      toStatus: "提案",
      transitionTimestamp: timestamp2,
    });

    // ステップ3: 「提案」→「交渉中」に遷移
    recordDealStatusTransition({
      dealId,
      customerId,
      fromStatus: "提案",
      toStatus: "交渉中",
      transitionTimestamp: timestamp3,
    });

    // ステップ4: 「交渉中」→「受注」に遷移
    recordDealStatusTransition({
      dealId,
      customerId,
      fromStatus: "交渉中",
      toStatus: "受注",
      transitionTimestamp: timestamp4,
    });

    // ステップ5: 遷移履歴を取得
    const history = getDealStatusHistory({ dealId });

    // 期待結果: 4件の遷移が時系列順に記録されている
    expect(history).toHaveLength(4);

    // 各遷移が正確な順序で記録されていることを確認
    expect(history[0]).toEqual({
      dealId,
      customerId,
      fromStatus: "リード",
      toStatus: "初期接触",
      transitionTimestamp: timestamp1,
      sequenceIndex: 1,
    });

    expect(history[1]).toEqual({
      dealId,
      customerId,
      fromStatus: "初期接触",
      toStatus: "提案",
      transitionTimestamp: timestamp2,
      sequenceIndex: 2,
    });

    expect(history[2]).toEqual({
      dealId,
      customerId,
      fromStatus: "提案",
      toStatus: "交渉中",
      transitionTimestamp: timestamp3,
      sequenceIndex: 3,
    });

    expect(history[3]).toEqual({
      dealId,
      customerId,
      fromStatus: "交渉中",
      toStatus: "受注",
      transitionTimestamp: timestamp4,
      sequenceIndex: 4,
    });

    // タイムスタンプが時系列順であることを確認
    expect(history[0].transitionTimestamp.getTime()).toBeLessThan(
      history[1].transitionTimestamp.getTime()
    );
    expect(history[1].transitionTimestamp.getTime()).toBeLessThan(
      history[2].transitionTimestamp.getTime()
    );
    expect(history[2].transitionTimestamp.getTime()).toBeLessThan(
      history[3].transitionTimestamp.getTime()
    );

    // 中間の遷移が欠落していないことを確認
    const statusSequence = history.map((record) => record.toStatus);
    expect(statusSequence).toEqual(["初期接触", "提案", "交渉中", "受注"]);
  });
});