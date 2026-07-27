import { describe, test, expect, beforeEach } from "@jest/globals";
import { verifyInvoiceIssuanceStatus } from "../../src/logic/it-1-3";

describe("売上実績・請求状況のリアルタイム集計・レポート生成", () => {
  // SCEN-646
  test("請求書が存在しないとき、請求書未発行状態と判定される", () => {
    // Arrange: 売上実績レコードを準備
    const salesRecord = {
      salesId: "SALES-001",
      customerId: "C001",
      salesDate: "2024-01-15",
      amount: 100000,
      currency: "JPY",
    };

    // DocumentStorageAdapterのモック化
    // 請求書ドキュメントが存在しないシナリオを再現
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue(null),
      generateShareLink: jest.fn().mockResolvedValue(null),
      deleteDocument: jest.fn().mockResolvedValue(true),
      getDocument: jest.fn().mockResolvedValue(null), // 請求書が存在しない
    };

    // Act: 売上実績に対して「請求書ズレ解消」機能の判定ロジックを実行
    const result = verifyInvoiceIssuanceStatus(
      salesRecord,
      mockDocumentStorageAdapter
    );

    // Assert: 請求書が存在しないことを検出し、
    // 請求書ステータスが『未発行（invoiceStatus = NOT_ISSUED）』と判定される
    expect(result.invoiceStatus).toBe("NOT_ISSUED");
    expect(result.isInvoiceIssued).toBe(false);
    expect(result.statusMessage).toMatch(/請求書未発行/);

    // DocumentStorageAdapterの呼び出しを検証
    expect(mockDocumentStorageAdapter.getDocument).toHaveBeenCalledWith(
      salesRecord.salesId
    );
  });
});