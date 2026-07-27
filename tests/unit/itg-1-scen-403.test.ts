import { fetchTimelineData } from "../../src/logic/it-1";

describe("顧客レコード画面の過去商談履歴・活動記録の時系列表示機能", () => {
  // SCEN-403
  test("入力データが undefined のとき、エラーが発生する", () => {
    const undefinedCustomerId = undefined;

    expect(() => {
      fetchTimelineData(undefinedCustomerId as any);
    }).toThrow(/顧客ID/);
  });
});