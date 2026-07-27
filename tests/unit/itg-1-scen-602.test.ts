import { describe, test, expect, beforeEach, afterEach, jest } from "@jest/globals";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-602
  test("DocumentStorageAdapterのuploadDocumentが1回目失敗時、指数バックオフで再試行する", async () => {
    // Mock setup
    const callTimestamps: number[] = [];
    let callCount = 0;

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(async (pdfBuffer: Buffer, fileName: string) => {
        callTimestamps.push(Date.now());
        callCount++;

        // 1回目は失敗、2回目以降は成功
        if (callCount === 1) {
          throw new Error("NetworkError");
        }

        return {
          fileId: "doc-12345",
          fileName: fileName,
          uploadedAt: new Date().toISOString(),
        };
      }),
      generateShareLink: jest.fn(async (fileId: string) => ({
        shareLink: `https://drive.google.com/file/d/${fileId}/view`,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      })),
      deleteDocument: jest.fn(async (fileId: string) => ({
        success: true,
      })),
    };

    // Import the function under test
    const { generateInvoiceWithRetry } = await import(
      "../../src/logic/it-1-1"
    );

    // Prepare test data
    const invoiceData = {
      customerId: "cust-001",
      customerName: "Test Customer Inc.",
      invoiceAmount: 150000,
      invoiceDate: new Date("2024-01-15T10:00:00Z"),
      dueDate: new Date("2024-02-15T10:00:00Z"),
      items: [
        {
          itemId: "item-001",
          description: "Product A",
          quantity: 3,
          unitPrice: 50000,
        },
      ],
    };

    // Execute with exponential backoff retry logic
    const result = await generateInvoiceWithRetry(
      invoiceData,
      mockDocumentStorageAdapter
    );

    // Assertions
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(2);

    // Verify timestamps: second call should occur ~1 second after first call
    expect(callTimestamps.length).toBe(2);
    const timeDifference = callTimestamps[1] - callTimestamps[0];
    expect(timeDifference).toBeGreaterThanOrEqual(900); // Allow 100ms tolerance
    expect(timeDifference).toBeLessThan(1500); // Should be close to 1000ms

    // Verify final result
    expect(result).toEqual({
      fileId: "doc-12345",
      fileName: expect.stringContaining("invoice"),
      uploadedAt: expect.any(String),
      success: true,
      retryCount: 1,
    });

    expect(result.fileId).toBe("doc-12345");
    expect(result.success).toBe(true);
    expect(result.retryCount).toBe(1);
  });
});