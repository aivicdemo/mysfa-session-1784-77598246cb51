import { describe, test, expect, beforeEach } from "@jest/globals";
import { generateAndUploadInvoicePDF } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成と商談ステータス紐付け", () => {
  let mockDocumentStorageAdapter: {
    uploadDocument: jest.Mock;
  };

  beforeEach(() => {
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
    };
  });

  // SCEN-995
  test("[normal] Google Drive API連携 - uploadDocumentが成功応答を受けた場合、生成されたPDFがクラウドストレージに保存される", async () => {
    const invoiceId = "INV-2024-001";
    const customerId = "CUST-12345";
    const invoiceAmount = 150000;
    const invoiceFileName = "invoice_2024_001.pdf";
    const invoiceMimeType = "application/pdf";
    const pdfBinaryData = Buffer.from("mock_pdf_binary_content");

    const uploadTimestamp = "2024-01-15T10:30:00Z";
    const uploadedFileId = "drive_file_id_abc123def456";
    const cloudStoragePath = "gs://company-storage/invoices/2024/01/invoice_2024_001.pdf";

    const assumedUploadSuccessResponse = {
      fileId: uploadedFileId,
      storagePath: cloudStoragePath,
      uploadedAt: uploadTimestamp,
      fileName: invoiceFileName,
      mimeType: invoiceMimeType,
      size: pdfBinaryData.length,
    };

    mockDocumentStorageAdapter.uploadDocument.mockResolvedValueOnce(
      assumedUploadSuccessResponse
    );

    const invoiceMetadata = {
      invoiceId: invoiceId,
      customerId: customerId,
      amount: invoiceAmount,
      fileName: invoiceFileName,
      mimeType: invoiceMimeType,
    };

    const result = await generateAndUploadInvoicePDF(
      pdfBinaryData,
      invoiceMetadata,
      mockDocumentStorageAdapter
    );

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      pdfBinaryData,
      invoiceMetadata
    );

    expect(result.uploadStatus).toBe("completed");
    expect(result.fileId).toBe(uploadedFileId);
    expect(result.storagePath).toBe(cloudStoragePath);
    expect(result.uploadedAt).toBe(uploadTimestamp);
    expect(result.isAccessible).toBe(true);

    expect(result.fileId).toEqual(uploadedFileId);
    expect(result.storagePath).toEqual(cloudStoragePath);
    expect(typeof result.uploadedAt).toBe("string");
  });
});