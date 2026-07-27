import { issueQuoteWithHistory } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-075
  test('帳票発行時の発行日時自動付与と発行履歴記録 - 同じ見積書を複数回発行したとき、各発行履歴の発行日時が異なる', () => {
    // Setup: テスト用顧客データ
    const customerData = {
      customerId: 'CUST-001',
      customerName: '株式会社テスト',
      emailAddress: 'contact@test-company.com',
    };

    // Setup: テスト用見積書テンプレートデータ
    const quoteTemplateData = {
      quoteId: 'QUOTE-2024-001',
      productName: 'システム構築サービス',
      unitPrice: 500000,
      quantity: 1,
      totalAmount: 500000,
      validityEndDate: '2024-02-15',
    };

    // Setup: DocumentStorageAdapter モック
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-2024-001',
        storageUrl: 'https://storage.example.com/quote-2024-001-v1.pdf',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://share.example.com/token-abc123',
        expiresAt: '2024-01-22T10:00:00Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // Setup: NotificationServiceAdapter モック
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-001',
        deliveryStatus: 'sent',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-002',
        deliveryStatus: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-003',
        deliveryStatus: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        status: 'opened',
        openedAt: '2024-01-15T10:15:00Z',
      }),
    };

    // Setup: システム時刻を固定値に設定（1回目発行時刻）
    const firstIssueTime = new Date('2024-01-15T10:00:00Z');

    // 1回目の見積書発行
    const firstIssueResult = issueQuoteWithHistory(
      {
        customerId: customerData.customerId,
        customerName: customerData.customerName,
        emailAddress: customerData.emailAddress,
      },
      {
        quoteId: quoteTemplateData.quoteId,
        productName: quoteTemplateData.productName,
        unitPrice: quoteTemplateData.unitPrice,
        quantity: quoteTemplateData.quantity,
        totalAmount: quoteTemplateData.totalAmount,
        validityEndDate: quoteTemplateData.validityEndDate,
      },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      firstIssueTime
    );

    expect(firstIssueResult.status).toBe('completed');
    expect(firstIssueResult.issueHistory[0].issuedAt).toEqual(
      new Date('2024-01-15T10:00:00Z')
    );
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledTimes(1);

    // Setup: システム時刻を進める（2回目発行時刻）
    const secondIssueTime = new Date('2024-01-15T14:30:45Z');

    // 2回目の見積書発行（同じ見積書）
    const secondIssueResult = issueQuoteWithHistory(
      {
        customerId: customerData.customerId,
        customerName: customerData.customerName,
        emailAddress: customerData.emailAddress,
      },
      {
        quoteId: quoteTemplateData.quoteId,
        productName: quoteTemplateData.productName,
        unitPrice: quoteTemplateData.unitPrice,
        quantity: quoteTemplateData.quantity,
        totalAmount: quoteTemplateData.totalAmount,
        validityEndDate: quoteTemplateData.validityEndDate,
      },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      secondIssueTime
    );

    expect(secondIssueResult.status).toBe('completed');
    expect(secondIssueResult.issueHistory).toHaveLength(2);
    expect(secondIssueResult.issueHistory[0].issuedAt).toEqual(
      new Date('2024-01-15T10:00:00Z')
    );
    expect(secondIssueResult.issueHistory[1].issuedAt).toEqual(
      new Date('2024-01-15T14:30:45Z')
    );
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(2);
    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledTimes(2);

    // Setup: システム時刻をさらに進める（3回目発行時刻）
    const thirdIssueTime = new Date('2024-01-16T09:15:20Z');

    // 3回目の見積書発行（同じ見積書）
    const thirdIssueResult = issueQuoteWithHistory(
      {
        customerId: customerData.customerId,
        customerName: customerData.customerName,
        emailAddress: customerData.emailAddress,
      },
      {
        quoteId: quoteTemplateData.quoteId,
        productName: quoteTemplateData.productName,
        unitPrice: quoteTemplateData.unitPrice,
        quantity: quoteTemplateData.quantity,
        totalAmount: quoteTemplateData.totalAmount,
        validityEndDate: quoteTemplateData.validityEndDate,
      },
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter,
      thirdIssueTime
    );

    expect(thirdIssueResult.status).toBe('completed');
    expect(thirdIssueResult.issueHistory).toHaveLength(3);
    expect(thirdIssueResult.issueHistory[0].issuedAt).toEqual(
      new Date('2024-01-15T10:00:00Z')
    );
    expect(thirdIssueResult.issueHistory[1].issuedAt).toEqual(
      new Date('2024-01-15T14:30:45Z')
    );
    expect(thirdIssueResult.issueHistory[2].issuedAt).toEqual(
      new Date('2024-01-16T09:15:20Z')
    );

    // Verify DocumentStorageAdapter の呼び出し回数
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(3);

    // Verify NotificationServiceAdapter の呼び出し回数
    expect(mockNotificationServiceAdapter.sendQuoteNotification).toHaveBeenCalledTimes(3);

    // Verify 各発行履歴レコードが異なる発行日時を持つ
    const issuedAtTimes = thirdIssueResult.issueHistory.map((record: any) =>
      record.issuedAt.toISOString()
    );
    expect(new Set(issuedAtTimes).size).toBe(3);
  });
});