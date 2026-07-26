import { updateDealStatusWithBillingLink } from "../../src/logic/it-1-2";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  test("SCEN-183: 存在しない商談IDへの更新要求がエラーハンドリングされる", async () => {
    // Arrange
    const nonExistentDealId = 99999999;
    const updatePayload = {
      dealId: nonExistentDealId,
      status: "受注",
      amount: 1000000,
    };

    // Act & Assert - 存在しない商談IDへの更新要求でエラーが発生すること
    await expect(updateDealStatusWithBillingLink(updatePayload)).rejects.toThrow(
      /商談/
    );
  });
});