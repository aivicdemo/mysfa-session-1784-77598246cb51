import { recordDelayedDealCustomerResponse } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-676
  test("遅延案件の顧客対応完了を記録する際、対応完了日が無効な日付形式のときバリデーションエラーが発生する", () => {
    const delayedDealId = "DEAL-20240415-001";
    const customerId = "CUST-2024-0042";
    const customerName = "テスト顧客株式会社";
    const responseContent = "顧客との電話で支払い予定日を確認。4月末までの支払いを約束。";

    const invalidDateFormats = [
      "2024-13-45",
      "2024/2/30",
      "abc",
      "2024年13月45日",
      "2024-02-30",
      "invalid-date",
      "",
      "2024/13/45",
    ];

    invalidDateFormats.forEach((invalidCompletionDate) => {
      const formData = {
        delayedDealId,
        customerId,
        customerName,
        responseContent,
        completionDate: invalidCompletionDate,
      };

      expect(() => recordDelayedDealCustomerResponse(formData)).toThrow(
        /日付形式/
      );
    });
  });
});