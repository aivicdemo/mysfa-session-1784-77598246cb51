import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import type {
  SalesRevenue,
  Invoice,
  DiscrepancyRecord,
  PaymentGatewayAdapter,
} from "../../src/logic/it-1784969823049-1-1-1";
import { reconcileSalesAndInvoiceStatus } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  let paymentGatewayAdapterStub: PaymentGatewayAdapter;

  beforeEach(() => {
    paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn().mockResolvedValue({
        transactionId: "TXN-20240115-001",
        paymentStatus: "completed",
        amount: 100000,
        paidAt: "2024-01-15T10:30:00Z",
      }),
      getTransactionStatus: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-978
  test("売上実績・請求状況照合機能 - 請求書支払い完了済み×売上入金未確認の場合、入金ステータス不整合として検出される", async () => {
    const currentTimestamp = new Date("2024-01-15T11:00:00Z");

    const salesRevenueRecord: SalesRevenue = {
      id: "SR-20240115-001",
      invoiceId: "INV-001",
      amount: 100000,
      paymentStatus: "unconfirmed",
      recordedAt: "2024-01-15T09:00:00Z",
    };

    const invoiceRecord: Invoice = {
      id: "INV-001",
      customerId: "CUST-A001",
      amount: 100000,
      paymentStatus: "completed",
      issuedAt: "2024-01-10T08:00:00Z",
      paidAt: "2024-01-15T10:30:00Z",
    };

    const discrepancyResult: DiscrepancyRecord[] = await reconcileSalesAndInvoiceStatus(
      [salesRevenueRecord],
      [invoiceRecord],
      paymentGatewayAdapterStub,
      currentTimestamp
    );

    expect(discrepancyResult).toHaveLength(1);

    const detectedDiscrepancy = discrepancyResult[0];

    expect(detectedDiscrepancy.discrepancyType).toBe("PAYMENT_STATUS_MISMATCH");
    expect(detectedDiscrepancy.invoiceId).toBe("INV-001");
    expect(detectedDiscrepancy.salesRevenueId).toBe("SR-20240115-001");
    expect(detectedDiscrepancy.expectedStatus).toBe("completed");
    expect(detectedDiscrepancy.actualStatus).toBe("unconfirmed");
    expect(detectedDiscrepancy.detectedAt).toEqual(currentTimestamp);
    expect(detectedDiscrepancy.severity).toBe("HIGH");
    expect(detectedDiscrepancy.resolutionStatus).toBe("unresolved");
  });
});