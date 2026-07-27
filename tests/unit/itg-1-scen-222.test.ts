import { updateDealStatusToContracted } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-222
  test("商談ステータスを成約に変更する際、ステータス変更履歴に成約への変更記録が追加される", () => {
    const dealId = "DEAL-001";
    const customerName = "テスト太郎";
    const amount = 500000;
    const previousStatus = "商談中";
    const newStatus = "成約";
    const changeTimestamp = new Date("2024-01-15T14:30:45Z");
    const loggedInUsername = "営業太郎";

    const result = updateDealStatusToContracted({
      dealId,
      customerName,
      amount,
      previousStatus,
      newStatus,
      changeTimestamp,
      loggedInUsername,
    });

    expect(result.dealId).toBe(dealId);
    expect(result.status).toBe(newStatus);
    expect(result.statusChangeHistory).toBeDefined();
    expect(result.statusChangeHistory.length).toBeGreaterThan(0);

    const latestChange = result.statusChangeHistory[0];
    expect(latestChange.previousStatus).toBe(previousStatus);
    expect(latestChange.newStatus).toBe(newStatus);
    expect(latestChange.changeTimestamp).toEqual(changeTimestamp);
    expect(latestChange.changedByUser).toBe(loggedInUsername);
    expect(latestChange.changeReason).toBe("");
  });
});