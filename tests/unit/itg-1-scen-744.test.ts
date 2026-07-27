import { reconcileDealStatusAndInvoiceData } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-744
  test("バッチ照合で一部の商談がズレを検出した場合、ズレ対象のみが結果に含まれる", () => {
    const testDeals = [
      {
        dealId: "A",
        status: "受注",
        systemRecordAmount: 100000,
      },
      {
        dealId: "B",
        status: "受注",
        systemRecordAmount: 50000,
      },
      {
        dealId: "C",
        status: "受注",
        systemRecordAmount: 75000,
      },
      {
        dealId: "D",
        status: "受注",
        systemRecordAmount: 200000,
      },
      {
        dealId: "E",
        status: "受注",
        systemRecordAmount: 30000,
      },
    ];

    const reconciliationEngineStub = jest.fn().mockReturnValue([
      {
        dealId: "B",
        status: "受注",
        systemRecordAmount: 50000,
        invoiceDataAmount: 55000,
        discrepancyAmount: 5000,
      },
      {
        dealId: "D",
        status: "受注",
        systemRecordAmount: 200000,
        invoiceDataAmount: 180000,
        discrepancyAmount: -20000,
      },
    ]);

    const result = reconcileDealStatusAndInvoiceData(
      testDeals,
      reconciliationEngineStub
    );

    expect(result).toHaveLength(2);

    const dealB = result.find((item) => item.dealId === "B");
    expect(dealB).toEqual({
      dealId: "B",
      status: "受注",
      systemRecordAmount: 50000,
      invoiceDataAmount: 55000,
      discrepancyAmount: 5000,
    });

    const dealD = result.find((item) => item.dealId === "D");
    expect(dealD).toEqual({
      dealId: "D",
      status: "受注",
      systemRecordAmount: 200000,
      invoiceDataAmount: 180000,
      discrepancyAmount: -20000,
    });

    const dealA = result.find((item) => item.dealId === "A");
    expect(dealA).toBeUndefined();

    const dealC = result.find((item) => item.dealId === "C");
    expect(dealC).toBeUndefined();

    const dealE = result.find((item) => item.dealId === "E");
    expect(dealE).toBeUndefined();

    expect(reconciliationEngineStub).toHaveBeenCalledWith(testDeals);
  });
});