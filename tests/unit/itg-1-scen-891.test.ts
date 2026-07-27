import {
  detectInvoiceStatusMismatch,
} from "../../src/logic/it-1784969823049-1-1-1";

// Mock for DocumentStorageAdapter
const mockDocumentStorageAdapter = {
  uploadDocument: jest.fn(),
  generateShareLink: jest.fn(),
  deleteDocument: jest.fn(),
};

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-891
  test("請求書承認検証機能 - 商談のステータスと請求書発行状況が不一致のとき、ズレ検出が陽性を返す", () => {
    // Arrange: テストデータの準備
    const dealId = "DEAL-001";
    const customerId = "CUST-A";
    const customerName = "A社";
    const dealAmount = 1000000; // 100万円
    const dealStatus = "成約";
    const invoiceStatus = "下書き";

    const dealRecord = {
      dealId: dealId,
      customerId: customerId,
      customerName: customerName,
      amount: dealAmount,
      status: dealStatus,
    };

    const invoiceRecord = {
      dealId: dealId,
      invoiceStatus: invoiceStatus,
      issuedDate: null,
    };

    // DocumentStorageAdapterをスタブ化
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValue({
      fileId: "FILE-001",
      fileName: "invoice_DEAL-001.pdf",
    });

    // Act: ズレ検出エンジンを呼び出し
    const mismatchResult = detectInvoiceStatusMismatch(
      dealRecord,
      invoiceRecord,
      mockDocumentStorageAdapter
    );

    // Assert: ズレ検出結果を検証
    expect(mismatchResult.isDetected).toBe(true);
    expect(mismatchResult.details.mismatchContent).toBe(
      "商談ステータス『成約』に対し請求書ステータス『下書き』が不一致"
    );
    expect(mismatchResult.details.mismatchType).toBe("発行遅延");
    expect(mismatchResult.details.targetDealId).toBe("DEAL-001");
    expect(mismatchResult.details.recommendedAction).toBe(
      "請求書の早期発行確認が必要"
    );
  });
});