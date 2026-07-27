import { searchCustomers } from "../../src/logic/it-1";

describe("顧客レコード画面 - 過去商談履歴・活動記録・課題解決状況", () => {
  // SCEN-368
  test("顧客マスタに登録されていない検索値を入力した場合、空の一覧が返される", () => {
    // Arrange
    const nonExistentSearchQuery = "存在しない顧客名XYZ";
    const mockCustomerRepository = {
      findByNameOrId: jest.fn().mockResolvedValue([]),
    };

    // Act
    const result = searchCustomers(nonExistentSearchQuery, mockCustomerRepository);

    // Assert
    expect(result).resolves.toEqual({
      customers: [],
      totalCount: 0,
      message: "検索結果：0件",
    });
  });
});