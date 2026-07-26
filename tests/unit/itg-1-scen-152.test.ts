import { fetchCustomerActivityRecords } from "../../src/logic/it-1";

describe("顧客レコード画面に過去の商談履歴・活動記録・課題解決状況を時系列で表示する機能", () => {
  // SCEN-152
  test("商談・活動記録が存在しない場合に空の結果セットが返される", () => {
    const customerId = "CUST-999999";
    const lookbackDays = 365;

    const result = fetchCustomerActivityRecords(customerId, lookbackDays);

    expect(result).toEqual({
      dealRecords: [],
      activityRecords: [],
      issueResolutionRecords: [],
      hasData: false,
      message: "該当する商談・活動記録がありません",
    });
    expect(Array.isArray(result.dealRecords)).toBe(true);
    expect(Array.isArray(result.activityRecords)).toBe(true);
    expect(Array.isArray(result.issueResolutionRecords)).toBe(true);
    expect(result.dealRecords.length).toBe(0);
    expect(result.activityRecords.length).toBe(0);
    expect(result.issueResolutionRecords.length).toBe(0);
    expect(result.hasData).toBe(false);
  });
});