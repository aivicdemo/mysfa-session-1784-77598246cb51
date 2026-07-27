import { generateInvoiceFromQuote } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-622
  test("複数の見積明細に重複データが含まれる場合、重複を含めたまま請求明細として計上される", () => {
    const quoteDetailLine1 = {
      quoteDetailId: "QD-001",
      productCode: "PROD-A",
      productName: "商品A",
      unitPrice: 1000,
      quantity: 5,
      lineTotal: 5000,
    };

    const quoteDetailLine2 = {
      quoteDetailId: "QD-002",
      productCode: "PROD-A",
      productName: "商品A",
      unitPrice: 1000,
      quantity: 5,
      lineTotal: 5000,
    };

    const quoteData = {
      quoteId: "QUOTE-001",
      customerId: "CUST-001",
      customerName: "テスト顧客",
      customerEmail: "customer@example.com",
      quoteDate: "2024-01-15",
      quoteTotalAmount: 10000,
      quoteDetails: [quoteDetailLine1, quoteDetailLine2],
      quoteStatus: "confirmed",
    };

    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-001",
        fileUrl: "https://example.com/invoices/INV-001.pdf",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://example.com/share/abc123",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const result = generateInvoiceFromQuote(quoteData, mockDocumentStorageAdapter);

    expect(result.invoiceId).toBeDefined();
    expect(result.invoiceDetails).toHaveLength(2);
    expect(result.invoiceDetails[0]).toEqual({
      invoiceDetailId: expect.any(String),
      productCode: "PROD-A",
      productName: "商品A",
      unitPrice: 1000,
      quantity: 5,
      lineTotal: 5000,
    });
    expect(result.invoiceDetails[1]).toEqual({
      invoiceDetailId: expect.any(String),
      productCode: "PROD-A",
      productName: "商品A",
      unitPrice: 1000,
      quantity: 5,
      lineTotal: 5000,
    });
    expect(result.invoiceTotalAmount).toBe(10000);
    expect(result.invoiceStatus).toBe("confirmed");
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        invoiceId: result.invoiceId,
        fileName: expect.stringMatching(/INV-/),
        contentType: "application/pdf",
      })
    );
  });
});