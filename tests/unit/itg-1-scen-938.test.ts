import { detectUnbilledSalesRecords } from "../../src/logic/it-1784969823049-1-1-1";

describe("売上実績・請求データ照合機能", () => {
  // SCEN-938
  test("売上実績に紐付く請求書が存在しない場合、未請求案件として報告される", () => {
    const salesRecordId = "SR-001";
    const customerId = "CUST-123";
    const salesAmount = 100000;
    const salesDate = "2024-01-15";
    const status = "確定";
    const detectionTime = new Date("2024-01-15T10:30:00Z");

    const salesRecord = {
      id: salesRecordId,
      customerId: customerId,
      amount: salesAmount,
      salesDate: salesDate,
      status: status,
    };

    const invoices: Array<{
      id: string;
      customerId: string;
      amount: number;
      invoiceDate: string;
    }> = [];

    const result = detectUnbilledSalesRecords([salesRecord], invoices, detectionTime);

    expect(result).toEqual(
      expect.objectContaining({
        unbilledRecords: expect.arrayContaining([
          expect.objectContaining({
            salesRecordId: salesRecordId,
            customerId: customerId,
            salesAmount: salesAmount,
            salesDate: salesDate,
            invoiceNumber: null,
            status: "未請求",
            detectedAt: detectionTime.toISOString(),
          }),
        ]),
        totalUnbilledCount: 1,
      })
    );
  });
});