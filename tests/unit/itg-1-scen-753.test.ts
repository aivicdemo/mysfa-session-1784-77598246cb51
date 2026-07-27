import { validateDealStatusTransition } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談ステータス遷移検証機能", () => {
  // SCEN-753: [normal] 複数の正当な遷移パスが存在する場合、すべてのパスが承認される
  test("複数の正当な遷移パスがすべて承認される", () => {
    const validTransitionRules = [
      {
        pathId: "pathA",
        transitions: [
          { fromStatus: "リード", toStatus: "提案" },
          { fromStatus: "提案", toStatus: "交渉" },
          { fromStatus: "交渉", toStatus: "受注" },
        ],
      },
      {
        pathId: "pathB",
        transitions: [
          { fromStatus: "リード", toStatus: "提案" },
          { fromStatus: "提案", toStatus: "受注" },
        ],
      },
      {
        pathId: "pathC",
        transitions: [
          { fromStatus: "リード", toStatus: "交渉" },
          { fromStatus: "交渉", toStatus: "受注" },
        ],
      },
    ];

    const dealRecordPathA = {
      dealId: "deal-001",
      currentStatus: "リード",
      targetStatus: "提案",
      transitionRules: validTransitionRules,
    };

    const resultPathAStep1 = validateDealStatusTransition(dealRecordPathA);
    expect(resultPathAStep1.isApproved).toBe(true);
    expect(resultPathAStep1.approvedPathIds).toContain("pathA");

    const dealRecordPathAStep2 = {
      dealId: "deal-001",
      currentStatus: "提案",
      targetStatus: "交渉",
      transitionRules: validTransitionRules,
    };

    const resultPathAStep2 = validateDealStatusTransition(dealRecordPathAStep2);
    expect(resultPathAStep2.isApproved).toBe(true);
    expect(resultPathAStep2.approvedPathIds).toContain("pathA");

    const dealRecordPathAStep3 = {
      dealId: "deal-001",
      currentStatus: "交渉",
      targetStatus: "受注",
      transitionRules: validTransitionRules,
    };

    const resultPathAStep3 = validateDealStatusTransition(dealRecordPathAStep3);
    expect(resultPathAStep3.isApproved).toBe(true);
    expect(resultPathAStep3.approvedPathIds).toContain("pathA");
    expect(resultPathAStep3.finalStatus).toBe("受注");

    const dealRecordPathB = {
      dealId: "deal-002",
      currentStatus: "リード",
      targetStatus: "提案",
      transitionRules: validTransitionRules,
    };

    const resultPathBStep1 = validateDealStatusTransition(dealRecordPathB);
    expect(resultPathBStep1.isApproved).toBe(true);
    expect(resultPathBStep1.approvedPathIds).toContain("pathB");

    const dealRecordPathBStep2 = {
      dealId: "deal-002",
      currentStatus: "提案",
      targetStatus: "受注",
      transitionRules: validTransitionRules,
    };

    const resultPathBStep2 = validateDealStatusTransition(dealRecordPathBStep2);
    expect(resultPathBStep2.isApproved).toBe(true);
    expect(resultPathBStep2.approvedPathIds).toContain("pathB");
    expect(resultPathBStep2.finalStatus).toBe("受注");

    const dealRecordPathC = {
      dealId: "deal-003",
      currentStatus: "リード",
      targetStatus: "交渉",
      transitionRules: validTransitionRules,
    };

    const resultPathCStep1 = validateDealStatusTransition(dealRecordPathC);
    expect(resultPathCStep1.isApproved).toBe(true);
    expect(resultPathCStep1.approvedPathIds).toContain("pathC");

    const dealRecordPathCStep2 = {
      dealId: "deal-003",
      currentStatus: "交渉",
      targetStatus: "受注",
      transitionRules: validTransitionRules,
    };

    const resultPathCStep2 = validateDealStatusTransition(dealRecordPathCStep2);
    expect(resultPathCStep2.isApproved).toBe(true);
    expect(resultPathCStep2.approvedPathIds).toContain("pathC");
    expect(resultPathCStep2.finalStatus).toBe("受注");

    expect(resultPathAStep3.transitionHistoryCount).toBe(3);
    expect(resultPathBStep2.transitionHistoryCount).toBe(2);
    expect(resultPathCStep2.transitionHistoryCount).toBe(2);

    expect(resultPathAStep3.allPathsFinalStatus).toEqual([
      "受注",
      "受注",
      "受注",
    ]);
  });
});