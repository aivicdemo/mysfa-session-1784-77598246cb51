import {
  reconcileSalesAndInvoices,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("売上実績・請求状況照合機能", () => {
  test("SCEN-966: 売上実績と請求書の照合データに重複レコードが含まれる場合、重複を除外して照合が実行される", () => {
    // テストデータ: 売上実績レコード（重複を含む3件）
    const salesRecords = [
      {
        customerId: "C001",
        amount: 100000,
        date: "2024-01-15",
      },
      {
        customerId: "C001",
        amount: 100000,
        date: "2024-01-15",
      },
      {
        customerId: "C002",
        amount: 50000,
        date: "2024-01-16",
      },
    ];

    // テストデータ: 請求書レコード（重複を含む3件）
    const invoiceRecords = [
      {
        customerId: "C001",
        amount: 100000,
        date: "2024-01-15",
      },
      {
        customerId: "C001",
        amount: 100000,
        date: "2024-01-15",
      },
      {
        customerId: "C002",
        amount: 50000,
        date: "2024-01-16",
      },
    ];

    // 照合処理を実行
    const reconciliationResult = reconcileSalesAndInvoices(
      salesRecords,
      invoiceRecords
    );

    // 期待結果: 重複が除外され、2つのユニークな照合グループが返される
    expect(reconciliationResult.reconciliationGroups).toHaveLength(2);

    // グループ1: 顧客C001、金額100,000円、日付2024-01-15
    expect(reconciliationResult.reconciliationGroups[0]).toEqual({
      customerId: "C001",
      amount: 100000,
      date: "2024-01-15",
      status: "一致",
      salesRecordCount: 1,
      invoiceRecordCount: 1,
    });

    // グループ2: 顧客C002、金額50,000円、日付2024-01-16
    expect(reconciliationResult.reconciliationGroups[1]).toEqual({
      customerId: "C002",
      amount: 50000,
      date: "2024-01-16",
      status: "一致",
      salesRecordCount: 1,
      invoiceRecordCount: 1,
    });

    // 重複除外の確認: 元データは6件だが、結果は2グループのみ
    expect(reconciliationResult.totalUniqueReconciliationCount).toBe(2);
    expect(reconciliationResult.duplicatesRemoved).toBe(4);
  });
});