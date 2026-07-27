import { recordDelayedDealCustomerResponse } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-675
  test("遅延案件IDが空のとき、バリデーションエラーが発生する", () => {
    const invalidInput = {
      delayed_deal_id: "",
      customer_name: "株式会社テスト",
      response_content: "顧客と対応完了",
      response_datetime: "2024-01-15T14:30:00Z",
    };

    expect(() => recordDelayedDealCustomerResponse(invalidInput)).toThrow(
      /遅延案件ID/
    );
  });
});