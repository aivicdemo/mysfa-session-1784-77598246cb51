import { reconcileSalesAndInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('売上実績・請求状況照合機能 - 同一条件での重複実行時の結果一貫性', () => {
  test('SCEN-968: 同じ入力条件で照合処理を2回実行した場合、両回の結果が完全に一致する', () => {
    // ========== Stub 定義 ==========
    const stubPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const stubDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const stubNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const stubSalesforceMetadataDataSource = {
      fetchLicenseUsers: jest.fn(),
      fetchEditionDetails: jest.fn(),
      fetchFeatureUsageMetrics: jest.fn(),
      fetchAnnualCostData: jest.fn(),
    };

    // ========== 照合条件設定 ==========
    const reconciliationCondition = {
      startDate: new Date('2024-01-01T00:00:00Z'),
      endDate: new Date('2024-01-31T23:59:59Z'),
      customerId: 'C001',
      invoiceStatus: 'unpaid',
    };

    // ========== Mock データ（外部サービス応答） ==========
    const assumedSalesRecords = [
      { salesId: 'S001', customerId: 'C001', amount: 150000, dealStatus: 'won', invoiceDate: new Date('2024-01-05T00:00:00Z') },
      { salesId: 'S002', customerId: 'C001', amount: 200000, dealStatus: 'won', invoiceDate: new Date('2024-01-10T00:00:00Z') },
      { salesId: 'S003', customerId: 'C001', amount: 180000, dealStatus: 'won', invoiceDate: new Date('2024-01-15T00:00:00Z') },
      { salesId: 'S004', customerId: 'C001', amount: 220000, dealStatus: 'won', invoiceDate: new Date('2024-01-20T00:00:00Z') },
      { salesId: 'S005', customerId: 'C001', amount: 175000, dealStatus: 'won', invoiceDate: new Date('2024-01-22T00:00:00Z') },
      { salesId: 'S006', customerId: 'C001', amount: 195000, dealStatus: 'won', invoiceDate: new Date('2024-01-25T00:00:00Z') },
      { salesId: 'S007', customerId: 'C001', amount: 160000, dealStatus: 'won', invoiceDate: new Date('2024-01-08T00:00:00Z') },
      { salesId: 'S008', customerId: 'C001', amount: 210000, dealStatus: 'won', invoiceDate: new Date('2024-01-12T00:00:00Z') },
      { salesId: 'S009', customerId: 'C001', amount: 185000, dealStatus: 'won', invoiceDate: new Date('2024-01-17T00:00:00Z') },
      { salesId: 'S010', customerId: 'C001', amount: 190000, dealStatus: 'won', invoiceDate: new Date('2024-01-23T00:00:00Z') },
      { salesId: 'S011', customerId: 'C001', amount: 205000, dealStatus: 'won', invoiceDate: new Date('2024-01-27T00:00:00Z') },
      { salesId: 'S012', customerId: 'C001', amount: 180000, dealStatus: 'won', invoiceDate: new Date('2024-01-30T00:00:00Z') },
    ];

    const assumedInvoiceRecords = [
      { invoiceId: 'INV001', customerId: 'C001', amount: 150000, status: 'unpaid', issuedDate: new Date('2024-01-05T00:00:00Z'), salesId: 'S001' },
      { invoiceId: 'INV002', customerId: 'C001', amount: 200000, status: 'unpaid', issuedDate: new Date('2024-01-10T00:00:00Z'), salesId: 'S002' },
      { invoiceId: 'INV003', customerId: 'C001', amount: 180000, status: 'unpaid', issuedDate: new Date('2024-01-15T00:00:00Z'), salesId: 'S003' },
      { invoiceId: 'INV004', customerId: 'C001', amount: 220000, status: 'unpaid', issuedDate: new Date('2024-01-20T00:00:00Z'), salesId: 'S004' },
      { invoiceId: 'INV005', customerId: 'C001', amount: 175000, status: 'unpaid', issuedDate: new Date('2024-01-22T00:00:00Z'), salesId: 'S005' },
      { invoiceId: 'INV006', customerId: 'C001', amount: 195000, status: 'unpaid', issuedDate: new Date('2024-01-25T00:00:00Z'), salesId: 'S006' },
      { invoiceId: 'INV007', customerId: 'C001', amount: 160000, status: 'unpaid', issuedDate: new Date('2024-01-08T00:00:00Z'), salesId: 'S007' },
      { invoiceId: 'INV008', customerId: 'C001', amount: 210000, status: 'unpaid', issuedDate: new Date('2024-01-12T00:00:00Z'), salesId: 'S008' },
      { invoiceId: 'INV009', customerId: 'C001', amount: 185000, status: 'unpaid', issuedDate: new Date('2024-01-17T00:00:00Z'), salesId: 'S009' },
      { invoiceId: 'INV010', customerId: 'C001', amount: 190000, status: 'unpaid', issuedDate: new Date('2024-01-23T00:00:00Z'), salesId: 'S010' },
      { invoiceId: 'INV011', customerId: 'C001', amount: 205000, status: 'unpaid', issuedDate: new Date('2024-01-27T00:00:00Z'), salesId: 'S011' },
      { invoiceId: 'INV012', customerId: 'C001', amount: 180000, status: 'unpaid', issuedDate: new Date('2024-01-30T00:00:00Z'), salesId: 'S012' },
    ];

    // ========== Stub の戻り値設定 ==========
    stubPaymentGatewayAdapter.getTransactionStatus.mockReturnValue({
      processedTransactions: [],
      pendingTransactions: [],
    });

    stubDocumentStorageAdapter.generateShareLink.mockReturnValue({
      shareLink: 'https://drive.example.com/share/temp-link-001',
    });

    stubNotificationServiceAdapter.getDeliveryStatus.mockReturnValue({
      deliveryLogs: [],
    });

    stubSalesforceMetadataDataSource.fetchLicenseUsers.mockReturnValue({
      users: [],
    });

    // ========== 1回目の照合処理実行 ==========
    const firstRunResult = reconcileSalesAndInvoices(
      reconciliationCondition,
      assumedSalesRecords,
      assumedInvoiceRecords,
      stubPaymentGatewayAdapter,
      stubDocumentStorageAdapter,
      stubNotificationServiceAdapter,
      stubSalesforceMetadataDataSource,
    );

    // ========== 1回目の結果を記録 ==========
    const firstRunReconcileCount = firstRunResult.reconciledSalesCount;
    const firstRunInvoiceCount = firstRunResult.invoiceCount;
    const firstRunTotalAmount = firstRunResult.totalMatchedAmount;
    const firstRunMatchStatus = firstRunResult.matchStatus;
    const firstRunDiscrepancies = firstRunResult.discrepancyDetails;
    const firstRunTimestamp = firstRunResult.executedAt;

    // ========== Stub をリセット（同一応答データを返すよう再構成） ==========
    stubPaymentGatewayAdapter.getTransactionStatus.mockClear();
    stubDocumentStorageAdapter.generateShareLink.mockClear();
    stubNotificationServiceAdapter.getDeliveryStatus.mockClear();
    stubSalesforceMetadataDataSource.fetchLicenseUsers.mockClear();

    stubPaymentGatewayAdapter.getTransactionStatus.mockReturnValue({
      processedTransactions: [],
      pendingTransactions: [],
    });

    stubDocumentStorageAdapter.generateShareLink.mockReturnValue({
      shareLink: 'https://drive.example.com/share/temp-link-001',
    });

    stubNotificationServiceAdapter.getDeliveryStatus.mockReturnValue({
      deliveryLogs: [],
    });

    stubSalesforceMetadataDataSource.fetchLicenseUsers.mockReturnValue({
      users: [],
    });

    // ========== 2回目の照合処理実行（同じ条件） ==========
    const secondRunResult = reconcileSalesAndInvoices(
      reconciliationCondition,
      assumedSalesRecords,
      assumedInvoiceRecords,
      stubPaymentGatewayAdapter,
      stubDocumentStorageAdapter,
      stubNotificationServiceAdapter,
      stubSalesforceMetadataDataSource,
    );

    // ========== 2回目の結果を記録 ==========
    const secondRunReconcileCount = secondRunResult.reconciledSalesCount;
    const secondRunInvoiceCount = secondRunResult.invoiceCount;
    const secondRunTotalAmount = secondRunResult.totalMatchedAmount;
    const secondRunMatchStatus = secondRunResult.matchStatus;
    const secondRunDiscrepancies = secondRunResult.discrepancyDetails;
    const secondRunTimestamp = secondRunResult.executedAt;

    // ========== アサーション：1回目と2回目の結果が完全に一致することを検証 ==========
    // 照合済み売上件数の一致
    expect(firstRunReconcileCount).toBe(12);
    expect(secondRunReconcileCount).toBe(12);
    expect(firstRunReconcileCount).toBe(secondRunReconcileCount);

    // 請求書件数の一致
    expect(firstRunInvoiceCount).toBe(12);
    expect(secondRunInvoiceCount).toBe(12);
    expect(firstRunInvoiceCount).toBe(secondRunInvoiceCount);

    // 合計金額の一致（¥2,450,000）
    expect(firstRunTotalAmount).toBe(2450000);
    expect(secondRunTotalAmount).toBe(2450000);
    expect(firstRunTotalAmount).toBe(secondRunTotalAmount);

    // 金額一致状況の一致（完全一致）
    expect(firstRunMatchStatus).toBe('complete_match');
    expect(secondRunMatchStatus).toBe('complete_match');
    expect(firstRunMatchStatus).toBe(secondRunMatchStatus);

    // 不一致詳細の一致（なし）
    expect(firstRunDiscrepancies).toEqual([]);
    expect(secondRunDiscrepancies).toEqual([]);
    expect(firstRunDiscrepancies).toEqual(secondRunDiscrepancies);

    // タイムスタンプが異なることを確認（処理実行時刻が異なるため）
    expect(firstRunTimestamp).not.toBe(secondRunTimestamp);

    // データ内容・計算結果・判定結果が二度の実行で変わらないことを最終確認
    expect({
      reconciledSalesCount: firstRunReconcileCount,
      invoiceCount: firstRunInvoiceCount,
      totalMatchedAmount: firstRunTotalAmount,
      matchStatus: firstRunMatchStatus,
      discrepancyDetails: firstRunDiscrepancies,
    }).toEqual({
      reconciledSalesCount: secondRunReconcileCount,
      invoiceCount: secondRunInvoiceCount,
      totalMatchedAmount: secondRunTotalAmount,
      matchStatus: secondRunMatchStatus,
      discrepancyDetails: secondRunDiscrepancies,
    });
  });
});