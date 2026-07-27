import { detectCustomerMismatch } from "../../src/logic/it-1784969823049-1-1-1";

describe("売上実績・請求状況照合 - 顧客ID不整合検出", () => {
  test("SCEN-962: 売上実績の顧客IDと請求書の顧客IDが一致しない場合、顧客不整合として検出される", () => {
    const salesRecordId = "SALES-2024-001";
    const invoiceId = "INV-2024-001";
    const reconciliationTimestamp = new Date("2024-01-20T10:30:00Z");

    const salesRecord = {
      id: salesRecordId,
      customerId: "CUST-001",
      amount: 100000,
      saleDate: new Date("2024-01-15T00:00:00Z"),
    };

    const invoiceRecord = {
      id: invoiceId,
      customerId: "CUST-002",
      amount: 100000,
      invoiceDate: new Date("2024-01-20T00:00:00Z"),
    };

    const result = detectCustomerMismatch(
      salesRecord,
      invoiceRecord,
      reconciliationTimestamp
    );

    expect(result).toEqual({
      status: "mismatch_detected",
      errorCode: "CUSTOMER_ID_MISMATCH",
      salesRecordId: salesRecordId,
      invoiceId: invoiceId,
      salesCustomerId: "CUST-001",
      invoiceCustomerId: "CUST-002",
      errorMessage: "売上実績の顧客ID「CUST-001」と請求書の顧客ID「CUST-002」が一致しません",
      detectionTimestamp: reconciliationTimestamp,
      reconciliationStatus: "unresolved",
    });

    expect(result.errorCode).toBe("CUSTOMER_ID_MISMATCH");
    expect(result.status).toBe("mismatch_detected");
    expect(result.reconciliationStatus).toBe("unresolved");
    expect(result.salesCustomerId).toBe("CUST-001");
    expect(result.invoiceCustomerId).toBe("CUST-002");
  });
});