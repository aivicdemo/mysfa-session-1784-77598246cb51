import { detectUnbilledDeals } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-541
  test("ステータスが『受注』かつ請求書が未発行の案件を『未請求案件』として特定できる", () => {
    const dealRecords = [
      {
        dealId: "DEAL-001",
        customerName: "顧客A",
        status: "受注",
        amount: 100000,
        createdDate: "2024-01-15",
      },
    ];

    const invoiceRecords: { dealId: string }[] = [];

    const result = detectUnbilledDeals(dealRecords, invoiceRecords);

    expect(result).toHaveLength(1);
    expect(result[0].dealId).toBe("DEAL-001");
    expect(result[0].status).toBe("受注");
    expect(result[0].invoiceStatus).toBe("未発行");
    expect(result[0].classification).toBe("未請求案件");
  });
});