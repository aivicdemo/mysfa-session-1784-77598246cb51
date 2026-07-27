import { reconcileSalesAndInvoiceData } from "../../src/logic/it-1784969823049-1-1-1";

describe("売上実績・請求データ照合機能", () => {
  // SCEN-936
  test("複数の売上実績が同一の商談に紐付いている場合、各売上実績ごとに照合結果が返される", () => {
    // Arrange: テストデータ準備
    const dealId = "deal-001";
    
    const salesRecords = [
      {
        id: "sales-001",
        dealId: dealId,
        amount: 100000,
        recordedDate: new Date("2024-01-15T00:00:00Z"),
      },
      {
        id: "sales-002",
        dealId: dealId,
        amount: 50000,
        recordedDate: new Date("2024-01-20T00:00:00Z"),
      },
      {
        id: "sales-003",
        dealId: dealId,
        amount: 75000,
        recordedDate: new Date("2024-02-01T00:00:00Z"),
      },
    ];

    const invoiceData = {
      dealId: dealId,
      totalAmount: 225000,
      invoiceDate: new Date("2024-02-05T00:00:00Z"),
    };

    // Act: 照合処理を実行
    const reconciliationResults = reconcileSalesAndInvoiceData(
      salesRecords,
      invoiceData
    );

    // Assert: 照合結果を検証
    // 照合結果の件数が3件であること
    expect(reconciliationResults).toHaveLength(3);

    // 照合結果1の検証
    expect(reconciliationResults[0]).toEqual({
      salesRecordId: "sales-001",
      reconciliationStatus: "一致",
      reconciliationDifference: 0,
    });

    // 照合結果2の検証
    expect(reconciliationResults[1]).toEqual({
      salesRecordId: "sales-002",
      reconciliationStatus: "一致",
      reconciliationDifference: 0,
    });

    // 照合結果3の検証
    expect(reconciliationResults[2]).toEqual({
      salesRecordId: "sales-003",
      reconciliationStatus: "一致",
      reconciliationDifference: 0,
    });

    // 売上実績の合計が請求額と一致すること
    const totalSalesAmount = salesRecords.reduce(
      (sum, record) => sum + record.amount,
      0
    );
    expect(totalSalesAmount).toBe(invoiceData.totalAmount);
  });
});