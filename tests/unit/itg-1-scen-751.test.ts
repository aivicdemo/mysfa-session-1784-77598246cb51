import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { detectInvoicingTimingDiscrepancy } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータス・請求データ照合機能", () => {
  let documentStorageAdapterMock: {
    uploadDocument: jest.Mock;
    generateShareLink: jest.Mock;
    deleteDocument: jest.Mock;
  };

  beforeEach(() => {
    documentStorageAdapterMock = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-001",
        storageUrl: "https://example.com/documents/DOC-001",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://example.com/share/link-001",
        expiresAt: new Date("2024-01-25T11:00:00Z"),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-751
  test("[normal] 請求書発行日が商談成立日より前の場合、時系列ズレが検出される", async () => {
    const dealRecord = {
      dealId: "DL-001",
      dealName: "テスト商談",
      dealClosedDate: new Date("2024-01-15T00:00:00Z"),
      status: "成立",
    };

    const invoiceRecord = {
      invoiceId: "INV-001",
      invoiceIssuedDate: new Date("2024-01-10T00:00:00Z"),
      correspondingDealId: "DL-001",
      amount: 100000,
    };

    const executionDateTime = new Date("2024-01-20T10:30:00Z");

    const result = await detectInvoicingTimingDiscrepancy(
      {
        targetDealId: dealRecord.dealId,
        dealClosedDate: dealRecord.dealClosedDate,
        dealStatus: dealRecord.status,
        invoiceIssuedDate: invoiceRecord.invoiceIssuedDate,
        invoiceId: invoiceRecord.invoiceId,
      },
      documentStorageAdapterMock,
      executionDateTime
    );

    expect(result.detectionStatus).toBe("時系列ズレ検出");
    expect(result.targetDealId).toBe("DL-001");
    expect(result.detectionContent).toBe(
      "請求書発行日（2024-01-10）が商談成立日（2024-01-15）より前である"
    );
    expect(result.dayDifference).toBe(-5);
    expect(result.severity).toBe("警告");
    expect(result.detectionDateTime).toEqual(executionDateTime);
    expect(result.requiresReview).toBe("要確認");
    expect(documentStorageAdapterMock.uploadDocument).toHaveBeenCalled();
  });
});