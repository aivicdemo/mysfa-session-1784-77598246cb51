import { determineInvoicingTiming } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  // SCEN-236
  test("請求実行タイミング判定機能 - 月次請求タイプの商談レコードが正しく抽出対象として確定される", () => {
    const dealRecord = {
      dealId: "DEAL-2024-001",
      customerId: "CUST-0001",
      dealAmount: 150000,
      dealStatus: "受注",
      invoicingType: "月次",
      invoicingScheduledDate: "2024-02-01",
      createdAt: "2024-01-15T10:30:00Z",
      lastUpdatedAt: "2024-01-15T10:30:00Z",
    };

    const result = determineInvoicingTiming(dealRecord);

    expect(result.dealId).toBe("DEAL-2024-001");
    expect(result.invoicingType).toBe("月次");
    expect(result.extractionStatusConfirmed).toBe(true);
    expect(result.dealStatus).toBe("抽出対象確定");
    expect(result.confirmationTimestamp).toBeDefined();
  });
});