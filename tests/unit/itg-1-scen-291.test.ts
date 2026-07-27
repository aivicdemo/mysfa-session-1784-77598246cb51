import { describe, test, expect, beforeEach, jest } from "@jest/globals";
import type {
  Deal,
  Invoice,
  DealInvoiceMappingResult,
} from "../../src/logic/it-1784969823049-1-1-1";
import {
  verifyDealInvoiceMapping,
} from "../../src/logic/it-1784969823049-1-1-1";

// Mock adapter interfaces
interface DocumentStorageAdapter {
  uploadDocument(
    fileName: string,
    pdfContent: Buffer
  ): Promise<{ documentId: string; fileUrl: string }>;
}

interface NotificationServiceAdapter {
  sendInvoiceNotification(
    customerId: string,
    invoiceId: string,
    recipientEmail: string
  ): Promise<{ deliveryStatus: string; messageId: string }>;
}

describe("商談ステータスと請求データの紐付け・可視化 - 月末請求書期日ズレ判定", () => {
  let mockDocumentStorageAdapter: DocumentStorageAdapter;
  let mockNotificationServiceAdapter: NotificationServiceAdapter;

  beforeEach(() => {
    // DocumentStorageAdapter スタブ設定
    mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "doc-2024-01-31-001",
        fileUrl: "https://drive.example.com/files/doc-2024-01-31-001",
      }),
    };

    // NotificationServiceAdapter スタブ設定
    mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        deliveryStatus: "delivered",
        messageId: "msg-20240131-001",
      }),
    };
  });

  // SCEN-291: 請求書発行日が月末のとき、期日ズレ判定が正常に実行される
  test("SCEN-291: 月末請求書の支払期限が正しく計算され、ステータス紐付けとダッシュボード可視化が確認される", async () => {
    // 1. テスト用商談レコード作成
    const inputDeal: Deal = {
      dealId: "deal-2024-001",
      dealName: "顧客A との大型契約",
      customerId: "cust-2024-001",
      customerName: "顧客A",
      dealAmount: 300000,
      dealStatus: "契約完了",
      dealCreatedDate: new Date("2024-01-15T10:00:00Z"),
    };

    // 2. 請求書生成日を月末（2024年1月31日）に設定
    const invoiceIssueDateString = "2024-01-31T15:30:00Z";
    const invoiceIssueDate = new Date(invoiceIssueDateString);

    // 3. 支払期限を「発行日から30日後」ルールで計算
    // 2024年1月31日 + 30日 = 2024年3月1日（ただし月末ルールで2月29日に調整）
    // 実装側が月末ルールを適用すると、2024年2月29日（閏年）になるべき
    const expectedPaymentDueDate = new Date("2024-02-29T23:59:59Z");

    // 4. 生成される請求書レコード
    const generatedInvoice: Invoice = {
      invoiceId: "inv-2024-01-31-001",
      dealId: inputDeal.dealId,
      customerId: inputDeal.customerId,
      customerName: inputDeal.customerName,
      invoiceAmount: inputDeal.dealAmount,
      invoiceStatus: "発行済み",
      issueDate: invoiceIssueDate,
      paymentDueDate: expectedPaymentDueDate,
      documentStorageId: "doc-2024-01-31-001",
      notificationMessageId: "msg-20240131-001",
    };

    // 5. 請求書発行処理を実行
    const mappingResult: DealInvoiceMappingResult = await verifyDealInvoiceMapping(
      inputDeal,
      generatedInvoice,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // 6. 支払期限日の検証
    expect(mappingResult.invoice.paymentDueDate).toEqual(expectedPaymentDueDate);

    // 7. 商談ステータスと請求書ステータスの紐付けを確認
    expect(mappingResult.dealStatus).toBe("契約完了");
    expect(mappingResult.invoiceStatus).toBe("発行済み");

    // 8. 期日ズレ判定の確認
    // 発行日 2024-01-31 から 30日後が 2024-02-29 なので、期日ズレなし
    expect(mappingResult.dueDateMismatchDetected).toBe(false);
    expect(mappingResult.dueDateMismatchReason).toBeNull();

    // 9. ダッシュボード可視化情報の検証
    expect(mappingResult.dashboardMapping).toEqual({
      dealId: inputDeal.dealId,
      dealName: inputDeal.dealName,
      customerId: inputDeal.customerId,
      customerName: inputDeal.customerName,
      dealAmount: 300000,
      dealStatus: "契約完了",
      invoiceId: generatedInvoice.invoiceId,
      invoiceAmount: 300000,
      invoiceStatus: "発行済み",
      issueDate: invoiceIssueDate,
      paymentDueDate: expectedPaymentDueDate,
      isMapped: true,
    });

    // 10. DocumentStorageAdapter が正しく呼ばれたことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();

    // 11. NotificationServiceAdapter が正しく呼ばれたことを確認
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();

    // 12. 紐付けマッピング状態の確認
    expect(mappingResult.isMapped).toBe(true);
    expect(mappingResult.mappingConfirmedAt).toBeDefined();
  });
});