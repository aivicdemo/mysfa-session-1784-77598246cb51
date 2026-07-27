import { searchCustomerRecords } from "../../src/logic/it-1";

describe("顧客レコード検索・権限制御機能", () => {
  // SCEN-499
  test("検索結果が101件のとき、設定上限に応じて制限される", () => {
    // 準備: 検索パラメータ
    const searchCondition = {
      query: "テスト顧客",
      limit: 100,
      currentPage: 1,
    };

    // モック: 101件のレコードを生成
    const mockCustomerRecords = Array.from({ length: 101 }, (_, index) => ({
      customerId: `CUST-${String(index + 1).padStart(3, "0")}`,
      customerName: `テスト顧客${index + 1}`,
      industry: "IT",
      registrationDate: "2024-01-01",
    }));

    // テスト対象関数を呼び出し
    const result = searchCustomerRecords(searchCondition, mockCustomerRecords);

    // 検証: 返却結果が設定上限100件で制限されていることを確認
    expect(result.displayedRecords).toHaveLength(100);

    // 検証: 最初と最後のレコード内容を確認
    expect(result.displayedRecords[0].customerId).toBe("CUST-001");
    expect(result.displayedRecords[99].customerId).toBe("CUST-100");

    // 検証: ページネーション情報を確認
    expect(result.pagination.currentPage).toBe(1);
    expect(result.pagination.totalRecords).toBe(101);
    expect(result.pagination.recordsPerPage).toBe(100);
    expect(result.pagination.hasNextPage).toBe(true);
    expect(result.pagination.totalPages).toBe(2);

    // 検証: システムログメッセージを確認
    expect(result.systemLog).toMatch(/検索実行/);
    expect(result.systemLog).toMatch(/該当件数101件/);
    expect(result.systemLog).toMatch(/設定上限100件に制限/);
    expect(result.systemLog).toMatch(/ページング処理開始/);
  });
});