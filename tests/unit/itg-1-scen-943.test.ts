import { reconcileSalesAndInvoices } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-943
  test("売上実績・請求データ照合機能 - 商談ステータスがnullの場合、照合対象外として除外される", () => {
    const salesRecords = [
      {
        dealId: "DEAL-001",
        dealStatus: null,
        amount: 100000,
        invoiceId: "INV-001",
      },
    ];

    const invoiceRecords = [
      {
        invoiceId: "INV-001",
        amount: 100000,
        invoiceStatus: "issued",
      },
    ];

    const result = reconcileSalesAndInvoices(salesRecords, invoiceRecords);

    expect(result.reconciled).not.toContain(
      expect.objectContaining({ dealId: "DEAL-001" })
    );

    expect(result.excluded).toContainEqual(
      expect.objectContaining({ dealId: "DEAL-001" })
    );

    expect(result.excluded[0].reason).toBe("dealStatus is null");
  });
});