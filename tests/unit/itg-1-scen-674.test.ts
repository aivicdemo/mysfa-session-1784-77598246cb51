import { recordDelayedDealCustomerResponse } from "../../src/logic/it-1784969823049-1-1-1";

describe("遅延案件の顧客対応完了記録機能", () => {
  // SCEN-674
  test("遅延案件の対応完了コメントを記録するとき、コメントが正確に保存される", () => {
    const dealId = "PROJ-2024-001";
    const userId = "user-123";
    const commentText =
      "顧客A社との電話にて納期遅延について謝罪し、代替案を提示。顧客了承。対応完了。";
    const recordedAt = new Date("2024-01-15T14:30:00Z");

    const result = recordDelayedDealCustomerResponse({
      dealId: dealId,
      userId: userId,
      commentText: commentText,
      recordedAt: recordedAt,
    });

    expect(result).toEqual({
      dealId: dealId,
      userId: userId,
      commentText: commentText,
      recordedAt: recordedAt,
      saved: true,
    });

    expect(result.saved).toBe(true);
    expect(result.commentText).toBe(commentText);
  });
});