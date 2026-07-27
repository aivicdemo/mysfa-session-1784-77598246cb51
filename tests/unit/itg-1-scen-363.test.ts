import { searchCustomersByAssignedSalesRep } from "../../src/logic/it-1";

describe("顧客検索機能 - 複数結果の昇順整列", () => {
  // SCEN-363
  test("複数の顧客が検索条件に合致する場合、結果の順序が顧客IDの昇順で整列される", () => {
    const salesRepName = "山田太郎";

    const searchResults = searchCustomersByAssignedSalesRep(salesRepName);

    const expectedOrderedCustomerIds = [
      "CUS-0010",
      "CUS-0015",
      "CUS-0025",
    ];

    expect(searchResults).toHaveLength(3);
    expect(searchResults[0].customerId).toBe("CUS-0010");
    expect(searchResults[1].customerId).toBe("CUS-0015");
    expect(searchResults[2].customerId).toBe("CUS-0025");

    const actualCustomerIds = searchResults.map((result) => result.customerId);
    expect(actualCustomerIds).toEqual(expectedOrderedCustomerIds);
  });
});