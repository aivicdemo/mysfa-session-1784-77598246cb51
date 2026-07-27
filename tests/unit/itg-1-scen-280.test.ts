import { detectDelayedDeal } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  // SCEN-280
  test("売上計上予定日が実際の請求日より前のとき、期日ズレが遅延案件として検出される", () => {
    const deal = {
      dealId: "DEAL-001",
      customerName: "顧客A",
      expectedRevenueDate: new Date("2024-01-15"),
    };

    const invoice = {
      invoiceId: "INV-001",
      invoiceDate: new Date("2024-01-20"),
      amount: 100000,
      status: "unpaid",
    };

    const result = detectDelayedDeal(deal, invoice);

    expect(result.isDelayed).toBe(true);
    expect(result.delayDays).toBe(5);
    expect(result.warningMessage).toBe(
      "期日ズレ検出：売上計上予定日(2024-01-15)より実請求日(2024-01-20)が5日遅延"
    );
    expect(result.internalStatusFlag).toBe("delay_detected");
    expect(result.displayStatus).toBe("要確認");
  });
});