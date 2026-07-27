import {
  linkInvoicesToDeal,
  InvoiceLinkResult,
  DealInvoiceDetails,
} from "../../src/logic/it-1784969823049-1-1-1";

// Mock adapter types
interface DocumentStorageAdapterStub {
  uploadDocument: jest.Mock;
  generateShareLink: jest.Mock;
  deleteDocument: jest.Mock;
}

interface NotificationServiceAdapterStub {
  sendInvoiceNotification: jest.Mock;
}

interface PaymentGatewayAdapterStub {
  generatePaymentLink: jest.Mock;
}

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  test("SCEN-275: 商談ステータスが『受注』に更新されたのに対応する請求書が複数件存在するとき、すべての請求書との紐付けが列挙される", () => {
    // Arrange: テストデータの準備
    const customerId = "CUST-001";
    const dealId = "DEAL-12345";

    const invoices = [
      {
        invoiceId: "INV-001",
        dealId: dealId,
        customerId: customerId,
        amount: 50000,
        status: "未発行",
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        invoiceId: "INV-002",
        dealId: dealId,
        customerId: customerId,
        amount: 30000,
        status: "未発行",
        createdAt: "2024-01-15T10:05:00Z",
      },
      {
        invoiceId: "INV-003",
        dealId: dealId,
        customerId: customerId,
        amount: 20000,
        status: "未発行",
        createdAt: "2024-01-15T10:10:00Z",
      },
    ];

    const deal = {
      dealId: dealId,
      customerId: customerId,
      status: "受注",
      previousStatus: "提案中",
      statusUpdatedAt: "2024-01-15T11:00:00Z",
    };

    // Mock adapters
    const documentStorageAdapter: DocumentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        fileId: "file-123",
        url: "https://example.com/file-123",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://drive.example.com/share/INV-001",
        expiresAt: "2024-01-22T11:00:00Z",
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const notificationServiceAdapter: NotificationServiceAdapterStub = {
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ messageId: "msg-001", sent: true }),
    };

    const paymentGatewayAdapter: PaymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: "https://payment.example.com/pay/INV-001",
        expiresAt: "2024-02-15T11:00:00Z",
      }),
    };

    // Act: 商談ステータスを『提案中』から『受注』に更新し、請求書との紐付けを実行
    const result: InvoiceLinkResult = linkInvoicesToDeal(
      deal,
      invoices,
      {
        documentStorageAdapter,
        notificationServiceAdapter,
        paymentGatewayAdapter,
      }
    );

    // Assert: 商談詳細画面に表示される請求書一覧を検証
    expect(result.linkedInvoices).toHaveLength(3);

    // 請求書1の検証
    const invoice001 = result.linkedInvoices.find(
      (inv) => inv.invoiceId === "INV-001"
    );
    expect(invoice001).toEqual({
      invoiceId: "INV-001",
      dealId: dealId,
      customerId: customerId,
      amount: 50000,
      status: "未発行",
      createdAt: "2024-01-15T10:00:00Z",
      paymentLink: "https://payment.example.com/pay/INV-001",
      shareLink: "https://drive.example.com/share/INV-001",
      paymentLinkActive: true,
      shareLinkActive: true,
    });

    // 請求書2の検証
    const invoice002 = result.linkedInvoices.find(
      (inv) => inv.invoiceId === "INV-002"
    );
    expect(invoice002).toEqual({
      invoiceId: "INV-002",
      dealId: dealId,
      customerId: customerId,
      amount: 30000,
      status: "未発行",
      createdAt: "2024-01-15T10:05:00Z",
      paymentLink: "https://payment.example.com/pay/INV-001",
      shareLink: "https://drive.example.com/share/INV-001",
      paymentLinkActive: true,
      shareLinkActive: true,
    });

    // 請求書3の検証
    const invoice003 = result.linkedInvoices.find(
      (inv) => inv.invoiceId === "INV-003"
    );
    expect(invoice003).toEqual({
      invoiceId: "INV-003",
      dealId: dealId,
      customerId: customerId,
      amount: 20000,
      status: "未発行",
      createdAt: "2024-01-15T10:10:00Z",
      paymentLink: "https://payment.example.com/pay/INV-001",
      shareLink: "https://drive.example.com/share/INV-001",
      paymentLinkActive: true,
      shareLinkActive: true,
    });

    // 全体的なリンク結果の検証
    expect(result.dealId).toBe(dealId);
    expect(result.dealStatus).toBe("受注");
    expect(result.totalInvoiceCount).toBe(3);
    expect(result.totalInvoiceAmount).toBe(100000);
    expect(result.linkedSuccessfully).toBe(true);

    // 外部サービス呼び出しの検証
    expect(documentStorageAdapter.generateShareLink).toHaveBeenCalledTimes(3);
    expect(paymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(3);
    expect(notificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalledTimes(
      3
    );
  });
});