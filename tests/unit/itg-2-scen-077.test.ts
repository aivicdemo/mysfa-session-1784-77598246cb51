import { issueInvoiceMultipleTimes } from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-077: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 同じ請求書を複数回発行したとき、各発行履歴の発行日時が異なる
  test("同一請求書の複数回発行時に、各発行履歴が別々のレコードとして異なる発行日時で記録される", async () => {
    const invoiceId = "INV-TEST-001";
    const customerId = "CUST-001";
    const invoiceAmount = 150000;

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-001",
        storageUrl: "https://storage.example.com/doc-001.pdf",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://share.example.com/link-001",
        expiresAt: "2024-01-22T10:30:45Z",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const firstIssuanceTimestamp = "2024-01-15T10:30:45Z";
    const secondIssuanceTimestamp = "2024-01-15T11:15:22Z";
    const thirdIssuanceTimestamp = "2024-01-15T14:45:08Z";

    const invoiceData = {
      invoiceId,
      customerId,
      invoiceAmount,
      invoiceDate: "2024-01-15",
      dueDate: "2024-02-15",
      items: [
        {
          itemId: "ITEM-001",
          description: "コンサルティングサービス",
          quantity: 1,
          unitPrice: 150000,
          subtotal: 150000,
        },
      ],
    };

    const result = await issueInvoiceMultipleTimes(
      invoiceData,
      [firstIssuanceTimestamp, secondIssuanceTimestamp, thirdIssuanceTimestamp],
      mockDocumentStorageAdapter
    );

    expect(result.issuanceHistories).toHaveLength(3);

    expect(result.issuanceHistories[0]).toEqual({
      issuanceSequence: 1,
      invoiceId,
      issuedAt: firstIssuanceTimestamp,
      documentId: "DOC-001",
      storageUrl: "https://storage.example.com/doc-001.pdf",
    });

    expect(result.issuanceHistories[1]).toEqual({
      issuanceSequence: 2,
      invoiceId,
      issuedAt: secondIssuanceTimestamp,
      documentId: "DOC-001",
      storageUrl: "https://storage.example.com/doc-001.pdf",
    });

    expect(result.issuanceHistories[2]).toEqual({
      issuanceSequence: 3,
      invoiceId,
      issuedAt: thirdIssuanceTimestamp,
      documentId: "DOC-001",
      storageUrl: "https://storage.example.com/doc-001.pdf",
    });

    expect(result.issuanceHistories[0].issuedAt).not.toBe(
      result.issuanceHistories[1].issuedAt
    );
    expect(result.issuanceHistories[1].issuedAt).not.toBe(
      result.issuanceHistories[2].issuedAt
    );
    expect(result.issuanceHistories[0].issuedAt).not.toBe(
      result.issuanceHistories[2].issuedAt
    );

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(3);
    expect(result.invoiceContent.invoiceId).toBe(invoiceId);
    expect(result.invoiceContent.customerId).toBe(customerId);
    expect(result.invoiceContent.invoiceAmount).toBe(invoiceAmount);
  });
});