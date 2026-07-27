import {
  reconcileDealStatusAndInvoice
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-513
  test("商談ステータスが「提案中」のとき、請求書との照合は実施されない", () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ fileId: "test-file-id" }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn()
    };

    const testDeal = {
      id: "deal-001",
      customerId: "customer-001",
      status: "提案中",
      amount: 1000000,
      lastReconciliationExecutedAt: new Date("2024-01-15T10:00:00Z")
    };

    const testInvoice = {
      id: "invoice-001",
      dealId: "deal-001",
      status: "未発行",
      amount: 100000,
      reconciliationStatus: "未照合"
    };

    const result = reconcileDealStatusAndInvoice(
      testDeal,
      testInvoice,
      mockDocumentStorageAdapter
    );

    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
    expect(result.dealLastReconciliationExecutedAt).toEqual(
      new Date("2024-01-15T10:00:00Z")
    );
    expect(result.invoiceReconciliationStatus).toBe("未照合");
  });
});