import { updateDealRecord } from "../../src/logic/it-1784969823049-2-1-1";

describe("商談レコードの進捗ステータスと提案内容の入力・保存機能", () => {
  // SCEN-222
  test("顧客対応状況と請求ステータスを同時に更新した場合、両方が正しい状態に更新される", () => {
    const dealRecordId = "deal-001";
    const customerId = "customer-001";
    const proposalAmount = 500000;

    const inputData = {
      dealRecordId,
      customerId,
      customerStatus: "協議中",
      billingStatus: "請求待ち",
      progressStatus: "提案資料提出済み",
      proposalContent: "提案資料を提出済み。顧客との協議中。次回打ち合わせは2月15日予定。",
      proposalAmount,
    };

    const result = updateDealRecord(inputData);

    expect(result.dealRecordId).toBe("deal-001");
    expect(result.customerId).toBe("customer-001");
    expect(result.customerStatus).toBe("協議中");
    expect(result.billingStatus).toBe("請求待ち");
    expect(result.progressStatus).toBe("提案資料提出済み");
    expect(result.proposalContent).toBe(
      "提案資料を提出済み。顧客との協議中。次回打ち合わせは2月15日予定。"
    );
    expect(result.proposalAmount).toBe(500000);
    expect(result.isSaved).toBe(true);
    expect(result.updatedAt).toBeDefined();
    expect(typeof result.updatedAt).toBe("string");
  });
});