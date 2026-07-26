import { reconcileSalesAndBilling } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向けポータル - 売上実績と請求状況の照合機能", () => {
  test("SCEN-048: 商談ステータスが受注で請求書発行日が商談日以降の場合、照合成功と判定される", () => {
    // Arrange: テストデータの準備
    const dealDate = new Date("2024-01-15T00:00:00Z");
    const invoiceIssuedDate = new Date("2024-01-15T00:00:00Z");

    const dealRecord = {
      dealId: "DEAL-001",
      customerId: "CUST-001",
      dealStatus: "受注",
      dealDate: dealDate,
      dealAmount: 1000000,
    };

    const invoiceRecord = {
      invoiceId: "INV-001",
      dealId: "DEAL-001",
      issuedDate: invoiceIssuedDate,
      invoiceAmount: 1000000,
    };

    // Act: 照合機能を実行
    const reconciliationResult = reconcileSalesAndBilling(dealRecord, invoiceRecord);

    // Assert: 照合結果が「成功」であることを検証
    expect(reconciliationResult.status).toBe("成功");
    expect(reconciliationResult.isMatched).toBe(true);
    expect(reconciliationResult.dealId).toBe("DEAL-001");
    expect(reconciliationResult.invoiceId).toBe("INV-001");
    expect(reconciliationResult.dealStatus).toBe("受注");
    expect(reconciliationResult.dealAmount).toBe(1000000);
    expect(reconciliationResult.invoiceAmount).toBe(1000000);
    expect(reconciliationResult.message).toBe("照合完了");

    // Assert: 請求書発行日が商談日以降であることを検証
    expect(reconciliationResult.invoiceIssuedDate.getTime()).toBeGreaterThanOrEqual(
      dealRecord.dealDate.getTime()
    );

    // Assert: 売上実績と請求状況が対応付けられていることを検証
    expect(reconciliationResult.amountMatchFlag).toBe(true);
    expect(reconciliationResult.dealDateComplianceFlag).toBe(true);
  });
});