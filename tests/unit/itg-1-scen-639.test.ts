import { describe, test, expect, beforeEach } from "@jest/globals";
import { detectInvoicingDiscrepancy } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-639
  test("商談クローズ日と請求書発行日が異なる年度をまたぐとき、正確なズレ日数が計算される", () => {
    // 準備：テスト用の商談データ
    const dealData = {
      dealId: "DEAL-2024-001",
      status: "クローズ済み",
      closeDate: new Date("2024-03-31T00:00:00Z"),
    };

    // 準備：テスト用の請求書データ
    const invoiceData = {
      invoiceId: "INV-2024-001",
      issueDate: new Date("2024-04-15T00:00:00Z"),
      dealId: "DEAL-2024-001",
    };

    // DocumentStorageAdapter をスタブ化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "file-12345",
        webViewLink: "https://drive.example.com/file/file-12345",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://drive.example.com/share/abc123",
        expiresAt: new Date("2024-04-30T00:00:00Z"),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapter をスタブ化
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: "msg-quote-001",
        status: "sent",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: "msg-order-001",
        status: "sent",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: "msg-invoice-001",
        status: "sent",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        deliveryStatus: "delivered",
        openedAt: new Date("2024-04-16T09:30:00Z"),
      }),
    };

    // 商談ステータスと請求書発行状況の自動照合・ズレ検出機能を実行
    const result = detectInvoicingDiscrepancy(
      dealData,
      invoiceData,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // 期待結果：ズレ日数が 15 日として正確に計算されていることを確認
    expect(result.discrepancyDays).toBe(15);
    expect(result.dealCloseDate).toEqual(new Date("2024-03-31T00:00:00Z"));
    expect(result.invoiceIssueDate).toEqual(new Date("2024-04-15T00:00:00Z"));
    expect(result.hasDiscrepancy).toBe(true);
    expect(result.discrepancyType).toBe("delayed");
  });
});