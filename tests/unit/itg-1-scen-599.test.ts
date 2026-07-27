import { generateInvoicePDF } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  test("SCEN-599: 生成した請求書をPDF形式に変換する", () => {
    // Arrange: DocumentStorageAdapterのモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "FILE_ID_20240115_001",
        status: "success",
        uploadedAt: "2024-01-15T10:30:00Z",
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // テストデータ: 請求書オブジェクト
    const invoiceData = {
      customerId: "CUST_20240115_001",
      customerName: "株式会社テスト",
      invoiceAmount: 150000,
      invoiceDate: "2024-01-15",
      dueDate: "2024-02-15",
      items: [
        {
          description: "システム開発費",
          quantity: 1,
          unitPrice: 150000,
          amount: 150000,
        },
      ],
      taxAmount: 0,
      totalAmount: 150000,
    };

    // Act: 請求書PDF生成処理を実行
    const pdfBinary = generateInvoicePDF(invoiceData, mockDocumentStorageAdapter);

    // Assert: PDF形式の検証

    // (1) PDFファイルヘッダが '%PDF' で始まることを確認
    const pdfSignature = pdfBinary.slice(0, 4).toString("ascii");
    expect(pdfSignature).toBe("%PDF");

    // (2) PDFバイナリサイズが 10KB 以上 1MB 以下であることを確認
    const fileSizeInBytes = pdfBinary.length;
    const minSizeBytes = 10 * 1024; // 10KB
    const maxSizeBytes = 1024 * 1024; // 1MB
    expect(fileSizeInBytes).toBeGreaterThanOrEqual(minSizeBytes);
    expect(fileSizeInBytes).toBeLessThanOrEqual(maxSizeBytes);

    // (3) 顧客名、請求金額、請求日、期限日が PDF 内に含まれていることを確認
    const pdfContent = pdfBinary.toString("utf8", 0, fileSizeInBytes);
    expect(pdfContent).toContain("株式会社テスト");
    expect(pdfContent).toContain("150000");
    expect(pdfContent).toContain("2024-01-15");
    expect(pdfContent).toContain("2024-02-15");

    // (4) DocumentStorageAdapter の uploadDocument メソッドが正確に1回呼び出されたことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);

    // uploadDocument に渡されたPDFバイナリが元の請求書内容を含むことを確認
    const uploadedPdfArg = mockDocumentStorageAdapter.uploadDocument.mock
      .calls[0][0];
    expect(uploadedPdfArg).toEqual(pdfBinary);
    expect(uploadedPdfArg.slice(0, 4).toString("ascii")).toBe("%PDF");

    // モックから返されたファイルIDをログ出力（テスト実行履歴に記録）
    const uploadResponse = mockDocumentStorageAdapter.uploadDocument
      .mock.results[0].value;
    console.log(
      `Invoice PDF generated and uploaded successfully. File ID: ${uploadResponse.fileId}`
    );
    expect(uploadResponse.fileId).toBe("FILE_ID_20240115_001");
    expect(uploadResponse.status).toBe("success");
  });
});