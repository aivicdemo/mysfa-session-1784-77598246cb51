import { generateInvoicePDF } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  // SCEN-598
  test("統一フォーマットの請求書を生成し、指定されたフォーマット仕様に適合する", async () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-20240115-001",
        storagePath: "/invoices/2024/01/INV-2024-001.pdf",
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const invoiceInput = {
      customerId: "CUST-ABC-001",
      customerName: "株式会社ABC",
      invoiceNumber: "INV-2024-001",
      invoiceDate: new Date("2024-01-15T00:00:00Z"),
      totalAmount: 150000,
      taxAmount: 15000,
      periodStart: new Date("2023-12-01T00:00:00Z"),
      periodEnd: new Date("2023-12-31T00:00:00Z"),
      lineItems: [
        {
          description: "システム利用料",
          quantity: 1,
          unitPrice: 150000,
          subtotal: 150000,
        },
      ],
      currencySymbol: "¥",
    };

    const generatedPDF = await generateInvoicePDF(
      invoiceInput,
      mockDocumentStorageAdapter
    );

    expect(generatedPDF).toBeDefined();
    expect(generatedPDF.title).toBe("請求書");
    expect(generatedPDF.invoiceNumber).toBe("INV-2024-001");
    expect(generatedPDF.customerName).toBe("株式会社ABC");
    expect(generatedPDF.invoiceDate).toEqual(new Date("2024-01-15T00:00:00Z"));
    expect(generatedPDF.totalAmountFormatted).toBe("¥150,000");
    expect(generatedPDF.taxAmountFormatted).toBe("¥15,000");
    expect(generatedPDF.periodRange).toBe("2023年12月1日～2023年12月31日");
    expect(generatedPDF.pageSize).toBe("A4");

    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "請求書",
        invoiceNumber: "INV-2024-001",
        customerName: "株式会社ABC",
      })
    );
  });
});