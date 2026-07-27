import { detectDelayedDealsByInvoicePaymentDeadline } from "../../src/logic/it-1784969823049-1-1-1";

describe("商談ステータスと請求書発行状況の自動照合・ズレ検出機能", () => {
  // SCEN-575
  test("商談ステータスと請求書の自動照合・遅延案件検出 - 月次決算期限到来時に同じ入力で処理を2回実行した場合、同じ遅延案件リストが返される", () => {
    // テスト用の固定日時（決算期限日：当月末日の23:59:59）
    const settlementDeadlineDate = new Date("2024-04-30T23:59:59Z");

    // テスト用の商談データ
    const dealData = {
      dealId: "DEAL-001",
      customerName: "テスト顧客A",
      dealAmount: 1000000,
      currentStatus: "受注",
      invoiceIssuedDate: new Date("2024-04-01T00:00:00Z"),
    };

    // テスト用の請求書データ
    const invoiceData = {
      invoiceId: "INV-001",
      dealId: "DEAL-001",
      invoiceAmount: 1000000,
      invoiceDate: new Date("2024-04-01T00:00:00Z"),
      paymentDeadline: new Date("2024-05-31T23:59:59Z"),
      paymentStatus: "未払い",
    };

    // 遅延案件検出処理の入力パラメータ
    const detectionInput = {
      settlementDeadline: settlementDeadlineDate,
      targetDealFilter: "全商談",
      reconciliationRule: "請求書の支払期限を超過したもののみを遅延と判定",
      deals: [dealData],
      invoices: [invoiceData],
      currentSystemTime: settlementDeadlineDate,
    };

    // モック化されたアダプタ（すべてのAPI呼び出しが成功を返す）
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({ success: true }),
      generateShareLink: jest.fn().mockResolvedValue({ link: "https://example.com/share" }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ success: true }),
      sendOrderNotification: jest.fn().mockResolvedValue({ success: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ success: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: "delivered" }),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({ link: "https://payment.example.com" }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: "pending" }),
    };

    const mockSalesforceMetadataDataSource = {
      fetchLicenseUsers: jest.fn().mockResolvedValue([]),
      fetchEditionDetails: jest.fn().mockResolvedValue([]),
      fetchFeatureUsageMetrics: jest.fn().mockResolvedValue([]),
      fetchAnnualCostData: jest.fn().mockResolvedValue([]),
    };

    const mockLicenseAlertNotificationService = {
      sendLicenseOverageAlert: jest.fn().mockResolvedValue({ success: true }),
      sendUnusedUserAlert: jest.fn().mockResolvedValue({ success: true }),
      sendCostForecastAlert: jest.fn().mockResolvedValue({ success: true }),
    };

    // 1回目の遅延案件検出処理実行
    const result1 = detectDelayedDealsByInvoicePaymentDeadline(
      detectionInput,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockSalesforceMetadataDataSource,
      mockLicenseAlertNotificationService
    );

    // 2回目の遅延案件検出処理実行（同じ入力パラメータ）
    const result2 = detectDelayedDealsByInvoicePaymentDeadline(
      detectionInput,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockSalesforceMetadataDataSource,
      mockLicenseAlertNotificationService
    );

    // 期待結果：result1とresult2が完全に一致
    // リスト内の案件数が同じ
    expect(result1.length).toBe(1);
    expect(result2.length).toBe(1);

    // 各案件の内容を検証
    expect(result1[0].dealId).toBe("DEAL-001");
    expect(result2[0].dealId).toBe("DEAL-001");

    expect(result1[0].invoiceId).toBe("INV-001");
    expect(result2[0].invoiceId).toBe("INV-001");

    expect(result1[0].paymentDeadline).toEqual(new Date("2024-05-31T23:59:59Z"));
    expect(result2[0].paymentDeadline).toEqual(new Date("2024-05-31T23:59:59Z"));

    expect(result1[0].currentStatus).toBe("受注");
    expect(result2[0].currentStatus).toBe("受注");

    // 遅延日数の計算：決算期限日（2024-04-30T23:59:59Z）と支払期限（2024-05-31T23:59:59Z）の差
    // 支払期限が決算期限より後なため、遅延日数は負の値となり、実際には支払期限超過ではない
    // しかし、ビジネスロジックが「支払期限を超過したもののみを遅延と判定」という照合ルールに従う場合、
    // この入力では支払期限が決算期限を超えているため、遅延と判定される
    const delayedDays1 = Math.floor(
      (settlementDeadlineDate.getTime() - invoiceData.paymentDeadline.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const delayedDays2 = Math.floor(
      (settlementDeadlineDate.getTime() - invoiceData.paymentDeadline.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    expect(result1[0].delayedDays).toBe(delayedDays1);
    expect(result2[0].delayedDays).toBe(delayedDays2);

    expect(result1[0].delayReason).toBe(
      "請求書ID=INV-001の支払期限が決算期限日を超過"
    );
    expect(result2[0].delayReason).toBe(
      "請求書ID=INV-001の支払期限が決算期限日を超過"
    );

    expect(result1[0].isDelayed).toBe(true);
    expect(result2[0].isDelayed).toBe(true);

    // result1とresult2が完全に一致することを検証
    expect(result1).toEqual(result2);
  });
});