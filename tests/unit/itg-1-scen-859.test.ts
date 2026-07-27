import { verifyInvoiceApproval } from "../../src/logic/it-1-1";

describe("見積・注文・請求書の自動生成機能", () => {
  test("SCEN-859: 請求書承認検証機能 - 顧客の住所が請求書に正確に反映される", async () => {
    // テスト用の顧客マスタデータを準備
    const customerData = {
      customerId: "CUST-001",
      customerName: "山田太郎",
      address: "東京都渋谷区道玄坂1-2-3 ビジネスビル5階",
    };

    // テスト用の請求書生成用データを準備
    const invoiceData = {
      invoiceId: "INV-20250115-001",
      customerId: "CUST-001",
      amount: 150000,
      invoiceDate: new Date("2025-01-15T00:00:00Z"),
      customerAddress: customerData.address,
    };

    // DocumentStorageAdapterをスタブ化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(async (pdfContent: string) => {
        return {
          status: "success",
          documentId: "DOC-20250115-001",
          content: pdfContent,
        };
      }),
      generateShareLink: jest.fn(async (documentId: string) => {
        return {
          status: "success",
          shareLink: "https://drive.example.com/share/DOC-20250115-001",
        };
      }),
      deleteDocument: jest.fn(async (documentId: string) => {
        return { status: "success" };
      }),
    };

    // 請求書承認検証機能を実行
    const result = await verifyInvoiceApproval(
      invoiceData.invoiceId,
      mockDocumentStorageAdapter
    );

    // 生成された請求書のPDF内に顧客住所が正確に記載されていることを検証
    expect(result.status).toBe("approved");
    expect(result.invoiceId).toBe("INV-20250115-001");
    expect(result.customerAddress).toBe(
      "東京都渋谷区道玄坂1-2-3 ビジネスビル5階"
    );
    expect(result.amount).toBe(150000);
    expect(result.invoiceDate).toEqual(new Date("2025-01-15T00:00:00Z"));

    // DocumentStorageAdapterのuploadDocumentが呼び出され、PDFコンテンツが保存されたことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();

    // 保存されたPDFコンテンツに顧客住所が含まれていることを確認
    const uploadedContent =
      mockDocumentStorageAdapter.uploadDocument.mock.results[0].value.content;
    expect(uploadedContent).toContain("東京都渋谷区道玄坂1-2-3 ビジネスビル5階");
    expect(uploadedContent).toContain("山田太郎");
  });
});