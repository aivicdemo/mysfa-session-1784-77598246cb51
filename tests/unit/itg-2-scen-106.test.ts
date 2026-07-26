import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import fetchMock from "jest-fetch-mock";
import {
  distributeBulkApprovedInvoices,
} from "../../src/logic/it-1784969823049-2-1-2";

fetchMock.enableMocks();

describe("顧客向けポータル - 請求書自動配信機能", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();
  });

  // SCEN-106
  test("複数請求書の一括承認時に全件が正常に顧客ポータルに配信される", async () => {
    const invoiceCount = 12;
    const invoiceIds = Array.from({ length: invoiceCount }, (_, i) =>
      `INV-2024-${String(i + 1).padStart(4, "0")}`
    );

    const distributionTimestamp = new Date("2024-01-15T09:30:00Z").toISOString();

    const mockInvoices = invoiceIds.map((id, index) => ({
      invoiceId: id,
      customerId: `CUST-${String(index + 1).padStart(3, "0")}`,
      customerName: `顧客企業${index + 1}`,
      invoiceAmount: 100000 + index * 10000,
      invoiceDate: new Date("2024-01-10T00:00:00Z").toISOString(),
      dueDate: new Date("2024-02-10T00:00:00Z").toISOString(),
      status: "pending_approval",
      itemCount: 3 + index,
    }));

    const approvalRequest = {
      portalUserId: "PORTAL-USER-001",
      selectedInvoiceIds: invoiceIds,
      approvalTimestamp: new Date("2024-01-15T09:25:00Z").toISOString(),
      approverName: "営業担当者太郎",
    };

    const expectedDistributionResponse = {
      distributionBatchId: "BATCH-20240115-001",
      totalInvoiceCount: invoiceCount,
      successCount: invoiceCount,
      failureCount: 0,
      distributionTimestamp: distributionTimestamp,
      invoiceDistributionResults: invoiceIds.map((id) => ({
        invoiceId: id,
        status: "distribution_completed",
        distributedTimestamp: distributionTimestamp,
        recipientPortalUserId: "PORTAL-USER-001",
        deliveryConfirmed: true,
      })),
    };

    const mockDistributionLog = {
      batchId: "BATCH-20240115-001",
      distributionDateTime: distributionTimestamp,
      distributedInvoiceCount: invoiceCount,
      distributionLogs: invoiceIds.map((id, index) => ({
        invoiceId: id,
        customerName: mockInvoices[index].customerName,
        distributionStatus: "completed",
        distributionTimestamp: distributionTimestamp,
        portalDeliveryConfirmed: true,
      })),
    };

    fetchMock.mockResponseOnce(JSON.stringify(expectedDistributionResponse), {
      status: 200,
    });

    fetchMock.mockResponseOnce(JSON.stringify(mockDistributionLog), {
      status: 200,
    });

    const result = await distributeBulkApprovedInvoices(approvalRequest);

    expect(result.distributionBatchId).toBe("BATCH-20240115-001");
    expect(result.totalInvoiceCount).toBe(12);
    expect(result.successCount).toBe(12);
    expect(result.failureCount).toBe(0);
    expect(result.distributionTimestamp).toBe(distributionTimestamp);

    expect(result.invoiceDistributionResults).toHaveLength(12);
    result.invoiceDistributionResults.forEach((distribution, index) => {
      expect(distribution.invoiceId).toBe(invoiceIds[index]);
      expect(distribution.status).toBe("distribution_completed");
      expect(distribution.distributedTimestamp).toBe(distributionTimestamp);
      expect(distribution.recipientPortalUserId).toBe("PORTAL-USER-001");
      expect(distribution.deliveryConfirmed).toBe(true);
    });

    const distributionLogTimestamps = result.invoiceDistributionResults.map(
      (d) => new Date(d.distributedTimestamp).getTime()
    );
    const timestampRange =
      Math.max(...distributionLogTimestamps) -
      Math.min(...distributionLogTimestamps);
    expect(timestampRange).toBeLessThanOrEqual(60000);

    expect(result.invoiceDistributionResults.every(
      (d) => d.status === "distribution_completed"
    )).toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstCallUrl = fetchMock.mock.calls[0][0];
    expect(firstCallUrl).toContain("/api/invoices/bulk-approve");
  });
});