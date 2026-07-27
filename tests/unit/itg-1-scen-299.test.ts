import {
  reconcileOrderAndInvoiceData,
} from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求データの紐付け・可視化", () => {
  test("SCEN-299: 同じ入力データで紐付け・ズレ検出を2回実行したとき、両回とも同じ結果が返される", () => {
    // Arrange: テスト用の商談データと請求データを準備
    const dealData = [
      {
        dealId: "DEAL-001",
        status: "成約",
        amount: 100000,
        customerId: "CUST-001",
        expectedInvoiceDate: new Date("2024-04-15T00:00:00Z"),
      },
      {
        dealId: "DEAL-002",
        status: "受注",
        amount: 250000,
        customerId: "CUST-002",
        expectedInvoiceDate: new Date("2024-04-20T00:00:00Z"),
      },
      {
        dealId: "DEAL-003",
        status: "完了",
        amount: 150000,
        customerId: "CUST-003",
        expectedInvoiceDate: new Date("2024-04-10T00:00:00Z"),
      },
    ];

    const invoiceData = [
      {
        invoiceId: "INV-001",
        amount: 100000,
        customerId: "CUST-001",
        invoiceDate: new Date("2024-04-15T00:00:00Z"),
      },
      {
        invoiceId: "INV-002",
        amount: 250000,
        customerId: "CUST-002",
        invoiceDate: new Date("2024-04-22T00:00:00Z"),
      },
      {
        invoiceId: "INV-003",
        amount: 150000,
        customerId: "CUST-003",
        invoiceDate: new Date("2024-04-09T00:00:00Z"),
      },
    ];

    // DocumentStorageAdapterのスタブ
    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: "DOC-123",
        url: "https://example.com/doc",
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: "https://example.com/share/abc123",
        expiresAt: new Date("2024-05-15T00:00:00Z"),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapterのスタブ
    const notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        status: "sent",
        messageId: "MSG-001",
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        status: "sent",
        messageId: "MSG-002",
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        status: "sent",
        messageId: "MSG-003",
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivered: true,
        opened: false,
      }),
    };

    // PaymentGatewayAdapterのスタブ
    const paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLink: "https://payment.example.com/pay/123",
        expiresAt: new Date("2024-05-01T00:00:00Z"),
      }),
      verifyPayment: jest.fn().mockResolvedValue({
        verified: true,
        transactionId: "TXN-001",
      }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        status: "completed",
        amount: 100000,
      }),
    };

    // SalesforceMetadataDataSourceのスタブ
    const salesforceMetadataDataSourceStub = {
      fetchLicenseUsers: jest.fn().mockResolvedValue([
        { userId: "USER-001", edition: "Professional" },
      ]),
      fetchEditionDetails: jest.fn().mockResolvedValue({
        Professional: { contractCount: 10, usedCount: 8 },
      }),
      fetchFeatureUsageMetrics: jest.fn().mockResolvedValue({
        apiCalls: { used: 5000, limit: 10000 },
      }),
      fetchAnnualCostData: jest.fn().mockResolvedValue({
        annualCost: 500000,
        renewalDate: new Date("2025-04-01T00:00:00Z"),
      }),
    };

    // Act: 1回目の紐付け・ズレ検出実行
    const firstExecutionResult = reconcileOrderAndInvoiceData(
      dealData,
      invoiceData,
      {
        documentStorageAdapter: documentStorageAdapterStub,
        notificationServiceAdapter: notificationServiceAdapterStub,
        paymentGatewayAdapter: paymentGatewayAdapterStub,
        salesforceMetadataDataSource: salesforceMetadataDataSourceStub,
      }
    );

    // Act: 2回目の紐付け・ズレ検出実行（同じ入力データで）
    const secondExecutionResult = reconcileOrderAndInvoiceData(
      dealData,
      invoiceData,
      {
        documentStorageAdapter: documentStorageAdapterStub,
        notificationServiceAdapter: notificationServiceAdapterStub,
        paymentGatewayAdapter: paymentGatewayAdapterStub,
        salesforceMetadataDataSource: salesforceMetadataDataSourceStub,
      }
    );

    // Assert: 1回目と2回目の結果が完全に同一であることを検証
    // 紐付けられた件数が同一
    expect(firstExecutionResult.reconciliedRecords.length).toBe(
      secondExecutionResult.reconciliedRecords.length
    );
    expect(firstExecutionResult.reconciliedRecords.length).toBe(3);

    // 各紐付けペアが同一順序で同じ内容
    firstExecutionResult.reconciliedRecords.forEach((firstRecord, index) => {
      const secondRecord = secondExecutionResult.reconciliedRecords[index];

      expect(firstRecord.dealId).toBe(secondRecord.dealId);
      expect(firstRecord.invoiceId).toBe(secondRecord.invoiceId);
      expect(firstRecord.customerId).toBe(secondRecord.customerId);
      expect(firstRecord.dealAmount).toBe(secondRecord.dealAmount);
      expect(firstRecord.invoiceAmount).toBe(secondRecord.invoiceAmount);
      expect(firstRecord.amountDifference).toBe(
        secondRecord.amountDifference
      );
      expect(firstRecord.dealExpectedInvoiceDate).toEqual(
        secondRecord.dealExpectedInvoiceDate
      );
      expect(firstRecord.actualInvoiceDate).toEqual(
        secondRecord.actualInvoiceDate
      );
      expect(firstRecord.daysDifference).toBe(secondRecord.daysDifference);
    });

    // 検出されたズレが同一
    expect(firstExecutionResult.detectedDiscrepancies.length).toBe(
      secondExecutionResult.detectedDiscrepancies.length
    );

    firstExecutionResult.detectedDiscrepancies.forEach(
      (firstDiscrepancy, index) => {
        const secondDiscrepancy =
          secondExecutionResult.detectedDiscrepancies[index];

        expect(firstDiscrepancy.dealId).toBe(secondDiscrepancy.dealId);
        expect(firstDiscrepancy.invoiceId).toBe(secondDiscrepancy.invoiceId);
        expect(firstDiscrepancy.discrepancyType).toBe(
          secondDiscrepancy.discrepancyType
        );
        expect(firstDiscrepancy.severity).toBe(secondDiscrepancy.severity);
        expect(firstDiscrepancy.details).toEqual(secondDiscrepancy.details);
      }
    );

    // 不整合フラグが同一
    expect(firstExecutionResult.hasInconsistencies).toBe(
      secondExecutionResult.hasInconsistencies
    );

    // 総紐付け件数が同一
    expect(firstExecutionResult.totalReconciliedCount).toBe(
      secondExecutionResult.totalReconciliedCount
    );
    expect(firstExecutionResult.totalReconciliedCount).toBe(3);

    // 処理タイムスタンプは異なる可能性があるため、存在することだけ確認
    expect(firstExecutionResult.processedAt).toBeDefined();
    expect(secondExecutionResult.processedAt).toBeDefined();
  });
});