import { validateDealStatusTransition } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-726
  test("逆向きのステータス遷移（降格）は拒否される", () => {
    const dealId = "deal-001";
    const statusHistory = [
      { status: "初期状態", timestamp: new Date("2024-01-01T09:00:00Z") },
      { status: "見積作成中", timestamp: new Date("2024-01-01T10:00:00Z") },
      { status: "提案中", timestamp: new Date("2024-01-01T11:00:00Z") },
      { status: "交渉中", timestamp: new Date("2024-01-01T12:00:00Z") },
    ];

    const currentStatus = "交渉中";
    const requestedStatus = "提案中";

    expect(() =>
      validateDealStatusTransition(dealId, currentStatus, requestedStatus, statusHistory)
    ).toThrow(/降格/);
  });
});