import { searchCustomerRecords } from "../../src/logic/it-1";

describe("顧客レコード検索・権限制御機能", () => {
  test("SCEN-486: 検索結果が0件のとき、空の一覧が返される", () => {
    const loggedInUserId = "user-001";
    const userTeamId = "team-sales-01";

    const searchCondition = {
      customerName: "存在しない顧客名",
      customerId: undefined,
      region: undefined,
    };

    const expectedResult = searchCustomerRecords(
      loggedInUserId,
      userTeamId,
      searchCondition
    );

    expect(Array.isArray(expectedResult)).toBe(true);
    expect(expectedResult).toEqual([]);
    expect(expectedResult.length).toBe(0);
  });
});