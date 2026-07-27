import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import { validateInvoiceContent } from "../../src/logic/it-1-1";

// Mock外部サービス依存性
interface DocumentStorageAdapterMock {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

interface ValidationResult {
  isValid: boolean;
  status: string;
  errorMessage: string;
}

describe("見積・注文・請求書の自動生成機能 - 帳票内容検証", () => {
  let documentStorageAdapterMock: DocumentStorageAdapterMock;

  beforeEach(() => {
    documentStorageAdapterMock = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "test-file-id-001",
        webViewLink: "https://drive.google.com/file/d/test-file-id-001/view",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://drive.google.com/file/d/test-file-id-001/view?usp=sharing",
        expiresAt: new Date("2025-01-20T12:00:00Z"),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };
  });

  // SCEN-263
  test("商談金額が業務上の上限値の場合、帳票検証は成功し、DocumentStorageAdapterへのuploadDocument呼び出しが実行される", async () => {
    const invoiceContentInput = {
      customerId: "CUST-20250117-001",
      customerName: "テスト顧客株式会社",
      dealAmount: 999999999,
      dealDescription: "大型システム導入案件",
      lineItems: [
        {
          itemId: "ITEM-001",
          itemName: "基本システムライセンス",
          quantity: 1,
          unitPrice: 500000000,
          amount: 500000000,
        },
        {
          itemId: "ITEM-002",
          itemName: "カスタマイズ・導入支援",
          quantity: 1,
          unitPrice: 499999999,
          amount: 499999999,
        },
      ],
      issueDate: new Date("2025-01-17T09:00:00Z"),
      dueDate: new Date("2025-02-17T23:59:59Z"),
      notes: "最大規模案件の検証テスト",
    };

    const validationResult: ValidationResult = await validateInvoiceContent(
      invoiceContentInput,
      documentStorageAdapterMock
    );

    expect(validationResult.isValid).toBe(true);
    expect(validationResult.status).toBe("正常");
    expect(validationResult.errorMessage).toBe("");

    expect(documentStorageAdapterMock.uploadDocument).toHaveBeenCalledTimes(1);
    expect(documentStorageAdapterMock.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        fileType: "application/pdf",
        fileName: expect.stringMatching(/^invoice_.+\.pdf$/),
      })
    );
  });
});