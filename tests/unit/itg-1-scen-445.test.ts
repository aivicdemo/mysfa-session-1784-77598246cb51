import { fetchResolvedIssuesForCustomer } from "../../src/logic/it-1";

describe("顧客レコード画面の商談履歴・活動記録表示 - 課題解決状況", () => {
  test("SCEN-445: 課題解決状況が0件の顧客レコードを表示するとき、空の一覧が返される", async () => {
    const customerId = "TEST-CUST-001";

    const result = await fetchResolvedIssuesForCustomer(customerId);

    expect(result).toEqual({
      customerId: "TEST-CUST-001",
      resolvedIssues: [],
      totalCount: 0,
      displayMessage: "課題解決状況はまだ登録されていません",
    });
    expect(result.resolvedIssues).toHaveLength(0);
    expect(result.totalCount).toBe(0);
  });
});