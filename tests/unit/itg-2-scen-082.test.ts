import {
  issueOrderAndRecordHistory,
} from "../../src/logic/it-1784969823049-2-1-2";

describe("顧客向け専用ポータルでの商談情報参照機能", () => {
  // SCEN-082
  test("帳票発行時の発行日時自動付与と発行履歴記録 - 注文書の発行履歴に営業担当者IDが正確に記録される", async () => {
    // Arrange
    const salesPersonId = "SALES-001";
    const orderId = "ORD-TEST-001";
    const customerId = "CUST-TEST-001";
    const issuedAt = new Date("2024-01-15T11:00:00Z");

    const mockDocumentStorage = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-001",
        shareLink: "https://example.com/doc/DOC-001",
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationService = {
      sendOrderNotification: jest.fn().mockResolvedValue({
        notificationId: "NOTIF-001",
        status: "sent",
      }),
      sendQuoteNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockAuditLog = {
      logDataAccess: jest.fn().mockResolvedValue({
        logId: "LOG-001",
      }),
      logUserAccess: jest.fn(),
      logPermissionChange: jest.fn(),
      queryAuditLog: jest.fn(),
    };

    const orderData = {
      orderId: orderId,
      customerId: customerId,
      items: [
        {
          itemId: "ITEM-001",
          productName: "テスト商品A",
          quantity: 2,
          unitPrice: 5000,
        },
        {
          itemId: "ITEM-002",
          productName: "テスト商品B",
          quantity: 1,
          unitPrice: 10000,
        },
      ],
      totalAmount: 20000,
    };

    // Act
    const result = await issueOrderAndRecordHistory(
      {
        salesPersonId: salesPersonId,
        orderId: orderId,
        customerId: customerId,
        orderData: orderData,
        issuedAt: issuedAt,
      },
      {
        documentStorage: mockDocumentStorage,
        notificationService: mockNotificationService,
        auditLog: mockAuditLog,
      }
    );

    // Assert
    expect(result).toEqual({
      success: true,
      historyRecord: {
        recordId: expect.any(String),
        salesPersonId: "SALES-001",
        orderId: "ORD-TEST-001",
        customerId: "CUST-TEST-001",
        issuedAt: new Date("2024-01-15T11:00:00Z"),
        status: "発行済み",
        documentId: "DOC-001",
        shareLink: "https://example.com/doc/DOC-001",
      },
    });

    expect(mockDocumentStorage.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "ORD-TEST-001",
        customerId: "CUST-TEST-001",
        totalAmount: 20000,
      })
    );

    expect(mockNotificationService.sendOrderNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: "CUST-TEST-001",
        orderId: "ORD-TEST-001",
        shareLink: "https://example.com/doc/DOC-001",
      })
    );

    expect(mockAuditLog.logDataAccess).toHaveBeenCalledWith(
      expect.objectContaining({
        salesPersonId: "SALES-001",
        operationType: "注文書発行",
        orderId: "ORD-TEST-001",
        timestamp: new Date("2024-01-15T11:00:00Z"),
      })
    );

    expect(result.historyRecord.salesPersonId).toBe("SALES-001");
    expect(result.historyRecord.orderId).toBe("ORD-TEST-001");
    expect(result.historyRecord.issuedAt.getTime()).toBe(
      new Date("2024-01-15T11:00:00Z").getTime()
    );
    expect(result.historyRecord.status).toBe("発行済み");
  });
});