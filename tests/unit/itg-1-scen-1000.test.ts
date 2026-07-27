import { generateAndUploadInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-1000: Google Drive API連携 - uploadDocumentが予期しない応答形式を返した場合、業務結果として不正な値が通されない', async () => {
    // ========== Setup: Stub の定義 ==========
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendInvoiceNotification: jest.fn(),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const mockLogger = {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    };

    const mockFileSystemService = {
      saveToTemporaryFolder: jest.fn(),
    };

    // 入力: 正常な請求書生成対象データ
    const invoiceGenerationRequest = {
      dealId: 'DEAL-20240115-001',
      customerId: 'CUST-001',
      customerName: '株式会社テスト営業',
      customerEmail: 'contact@test-sales.co.jp',
      dealAmount: 500000,
      dealStatus: '受注',
      dealDate: new Date('2024-01-15T09:00:00Z'),
      invoiceDetails: [
        {
          itemDescription: 'システム開発サービス',
          unitPrice: 250000,
          quantity: 2,
          taxRate: 0.1,
        },
      ],
      invoiceDueDate: new Date('2024-02-15T00:00:00Z'),
    };

    // ========== Trigger 1: uploadDocumentが null を返すケース ==========
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValueOnce(null);
    mockFileSystemService.saveToTemporaryFolder.mockResolvedValueOnce({
      temporaryPath: '/tmp/invoice_20240115_DEAL-20240115-001.pdf',
      savedAt: new Date('2024-01-15T10:30:00Z'),
    });

    const result_null = await generateAndUploadInvoice(
      invoiceGenerationRequest,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockLogger,
      mockFileSystemService
    );

    // 検証 1-1: エラーログに記録されているか
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Google Drive API')
    );

    // 検証 1-2: 不正な値（null）がデータベースに保存されていないか
    expect(result_null.persistedDocumentId).not.toBeNull();
    expect(result_null.persistedDocumentId).toMatch(/^FALLBACK_/);

    // 検証 1-3: 代替動作として一時フォルダに保存されているか
    expect(mockFileSystemService.saveToTemporaryFolder).toHaveBeenCalled();
    expect(result_null.fallbackTemporaryPath).toBe('/tmp/invoice_20240115_DEAL-20240115-001.pdf');

    // 検証 1-4: ユーザーメッセージが返却されているか
    expect(result_null.userMessage).toMatch(/文書の保存に失敗/);

    // ========== Trigger 2: uploadDocumentが undefined を返すケース ==========
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValueOnce(undefined);
    mockFileSystemService.saveToTemporaryFolder.mockResolvedValueOnce({
      temporaryPath: '/tmp/invoice_20240115_DEAL-20240115-002.pdf',
      savedAt: new Date('2024-01-15T10:31:00Z'),
    });
    mockLogger.error.mockClear();

    const result_undefined = await generateAndUploadInvoice(
      { ...invoiceGenerationRequest, dealId: 'DEAL-20240115-002' },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockLogger,
      mockFileSystemService
    );

    expect(mockLogger.error).toHaveBeenCalled();
    expect(result_undefined.persistedDocumentId).toMatch(/^FALLBACK_/);
    expect(result_undefined.fallbackTemporaryPath).toBe('/tmp/invoice_20240115_DEAL-20240115-002.pdf');

    // ========== Trigger 3: uploadDocumentが string を返すケース ==========
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValueOnce('invalid_string_response');
    mockFileSystemService.saveToTemporaryFolder.mockResolvedValueOnce({
      temporaryPath: '/tmp/invoice_20240115_DEAL-20240115-003.pdf',
      savedAt: new Date('2024-01-15T10:32:00Z'),
    });
    mockLogger.error.mockClear();

    const result_string = await generateAndUploadInvoice(
      { ...invoiceGenerationRequest, dealId: 'DEAL-20240115-003' },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockLogger,
      mockFileSystemService
    );

    expect(mockLogger.error).toHaveBeenCalled();
    expect(result_string.persistedDocumentId).toMatch(/^FALLBACK_/);
    expect(result_string.fallbackTemporaryPath).toBe('/tmp/invoice_20240115_DEAL-20240115-003.pdf');

    // ========== Trigger 4: uploadDocumentが配列を返すケース ==========
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValueOnce(['item1', 'item2']);
    mockFileSystemService.saveToTemporaryFolder.mockResolvedValueOnce({
      temporaryPath: '/tmp/invoice_20240115_DEAL-20240115-004.pdf',
      savedAt: new Date('2024-01-15T10:33:00Z'),
    });
    mockLogger.error.mockClear();

    const result_array = await generateAndUploadInvoice(
      { ...invoiceGenerationRequest, dealId: 'DEAL-20240115-004' },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockLogger,
      mockFileSystemService
    );

    expect(mockLogger.error).toHaveBeenCalled();
    expect(result_array.persistedDocumentId).toMatch(/^FALLBACK_/);

    // ========== Trigger 5: uploadDocumentが不完全なオブジェクト（fileId 欠落）を返すケース ==========
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValueOnce({
      uploadTimestamp: 1705315200000,
    });
    mockFileSystemService.saveToTemporaryFolder.mockResolvedValueOnce({
      temporaryPath: '/tmp/invoice_20240115_DEAL-20240115-005.pdf',
      savedAt: new Date('2024-01-15T10:34:00Z'),
    });
    mockLogger.error.mockClear();

    const result_incomplete_object = await generateAndUploadInvoice(
      { ...invoiceGenerationRequest, dealId: 'DEAL-20240115-005' },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockLogger,
      mockFileSystemService
    );

    expect(mockLogger.error).toHaveBeenCalled();
    expect(result_incomplete_object.persistedDocumentId).toMatch(/^FALLBACK_/);
    expect(result_incomplete_object.fallbackTemporaryPath).toBe('/tmp/invoice_20240115_DEAL-20240115-005.pdf');

    // ========== Trigger 6: uploadDocumentが不完全なオブジェクト（uploadTimestamp 欠落）を返すケース ==========
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValueOnce({
      fileId: 'file-xyz789',
    });
    mockFileSystemService.saveToTemporaryFolder.mockResolvedValueOnce({
      temporaryPath: '/tmp/invoice_20240115_DEAL-20240115-006.pdf',
      savedAt: new Date('2024-01-15T10:35:00Z'),
    });
    mockLogger.error.mockClear();

    const result_missing_timestamp = await generateAndUploadInvoice(
      { ...invoiceGenerationRequest, dealId: 'DEAL-20240115-006' },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockLogger,
      mockFileSystemService
    );

    expect(mockLogger.error).toHaveBeenCalled();
    expect(result_missing_timestamp.persistedDocumentId).toMatch(/^FALLBACK_/);
    expect(result_missing_timestamp.fallbackTemporaryPath).toBe('/tmp/invoice_20240115_DEAL-20240115-006.pdf');

    // ========== Trigger 7: uploadDocumentが不正な型の値を返すケース（Boolean） ==========
    mockDocumentStorageAdapter.uploadDocument.mockResolvedValueOnce(true);
    mockFileSystemService.saveToTemporaryFolder.mockResolvedValueOnce({
      temporaryPath: '/tmp/invoice_20240115_DEAL-20240115-007.pdf',
      savedAt: new Date('2024-01-15T10:36:00Z'),
    });
    mockLogger.error.mockClear();

    const result_boolean = await generateAndUploadInvoice(
      { ...invoiceGenerationRequest, dealId: 'DEAL-20240115-007' },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      mockPaymentGatewayAdapter,
      mockLogger,
      mockFileSystemService
    );

    expect(mockLogger.error).toHaveBeenCalled();
    expect(result_boolean.persistedDocumentId).toMatch(/^FALLBACK_/);

    // ========== 統合検証: すべてのケースで共通の期待結果を確認 ==========
    const allResults = [
      result_null,
      result_undefined,
      result_string,
      result_array,
      result_incomplete_object,
      result_missing_timestamp,
      result_boolean,
    ];

    allResults.forEach((result) => {
      // 検証: 不正な値がデータベース永続化されていない
      expect(result.persistedDocumentId).toBeDefined();
      expect(result.persistedDocumentId).not.toBeNull();
      // FALLBACK_ プレフィックスにより、本来の Google Drive fileId ではなく代替値であることを示す
      expect(result.persistedDocumentId).toMatch(/^FALLBACK_/);

      // 検証: 代替動作として一時フォルダパスが設定されている
      expect(result.fallbackTemporaryPath).toBeDefined();
      expect(result.fallbackTemporaryPath).toMatch(/^\/tmp\/invoice_/);

      // 検証: ユーザーメッセージが返却されている
      expect(result.userMessage).toBeDefined();
      expect(result.userMessage).toMatch(/文書の保存に失敗/);

      // 検証: システム管理者への問い合わせを促す内容が含まれている
      expect(result.userMessage).toMatch(/システム管理者/);
    });

    // ========== 最終検証: 一時ファイル保存が複数回呼ばれたことを確認 ==========
    expect(mockFileSystemService.saveToTemporaryFolder).toHaveBeenCalledTimes(7);
  });
});