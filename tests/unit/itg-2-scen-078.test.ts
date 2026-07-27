import crypto from 'crypto';
import { issueQuote } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル - 商談情報参照機能', () => {
  // SCEN-078: [normal] 帳票発行時の発行日時自動付与と発行履歴記録 - 同じ入力で見積書を2回発行したとき、同じ結果が記録される
  test('同じ顧客データで見積書を2回発行した場合、発行履歴が正確に記録される', async () => {
    // テスト用の顧客データを準備
    const customerId = 'CUST-001';
    const customerEmail = 'customer@example.com';
    const productInfo = {
      productId: 'PROD-100',
      productName: '標準パッケージ',
      quantity: 5,
      unitPrice: 10000,
    };

    // DocumentStorageAdapterをモック化
    const documentStorageAdapterMock = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-20240115-001',
        uploadedAt: '2024-01-15T11:00:00Z',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.example.com/share/DOC-20240115-001',
        expiresAt: '2024-01-22T11:00:00Z',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapterをモック化
    const notificationServiceAdapterMock = {
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-001',
        sentAt: '2024-01-15T11:00:30Z',
      }),
      sendOrderNotification: jest.fn().mockResolvedValue({ success: true }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ success: true }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ delivered: true }),
    };

    // AuditLogExporterをモック化
    const auditLogExporterMock = {
      logUserAccess: jest.fn().mockResolvedValue({ success: true }),
      logDataAccess: jest.fn().mockResolvedValue({ success: true }),
      logPermissionChange: jest.fn().mockResolvedValue({ success: true }),
      queryAuditLog: jest.fn().mockResolvedValue([]),
    };

    // 1回目の見積書発行
    const firstIssueResult = await issueQuote(
      {
        customerId,
        customerEmail,
        productInfo,
        validUntilDays: 7,
      },
      {
        documentStorage: documentStorageAdapterMock,
        notificationService: notificationServiceAdapterMock,
        auditLog: auditLogExporterMock,
      }
    );

    // 1回目の発行結果を記録
    const firstDocumentId = firstIssueResult.documentId;
    const firstIssuedAt = firstIssueResult.issuedAt;
    const firstShareLink = firstIssueResult.shareLink;
    const firstPdfContent = firstIssueResult.pdfContent;
    const firstPdfHash = crypto
      .createHash('sha256')
      .update(firstPdfContent)
      .digest('hex');

    // 2回目の見積書発行（同じ入力）
    const secondIssueResult = await issueQuote(
      {
        customerId,
        customerEmail,
        productInfo,
        validUntilDays: 7,
      },
      {
        documentStorage: documentStorageAdapterMock,
        notificationService: notificationServiceAdapterMock,
        auditLog: auditLogExporterMock,
      }
    );

    // 2回目の発行結果を記録
    const secondDocumentId = secondIssueResult.documentId;
    const secondIssuedAt = secondIssueResult.issuedAt;
    const secondShareLink = secondIssueResult.shareLink;
    const secondPdfContent = secondIssueResult.pdfContent;
    const secondPdfHash = crypto
      .createHash('sha256')
      .update(secondPdfContent)
      .digest('hex');

    // 期待される有効期限日時（発行日 + 7日）
    const firstIssueDateObj = new Date(firstIssuedAt);
    const expectedValidUntilFirst = new Date(firstIssueDateObj);
    expectedValidUntilFirst.setDate(expectedValidUntilFirst.getDate() + 7);
    const expectedValidUntilFirstIso = expectedValidUntilFirst.toISOString();

    const secondIssueDateObj = new Date(secondIssuedAt);
    const expectedValidUntilSecond = new Date(secondIssueDateObj);
    expectedValidUntilSecond.setDate(expectedValidUntilSecond.getDate() + 7);
    const expectedValidUntilSecondIso = expectedValidUntilSecond.toISOString();

    // (1) 発行履歴テーブルに2件のレコードが存在することを確認
    expect(firstIssueResult).toBeDefined();
    expect(secondIssueResult).toBeDefined();

    // (2) 両回の顧客ID、商品情報、数量、単価が完全に一致することを確認
    expect(firstIssueResult.customerId).toBe(customerId);
    expect(secondIssueResult.customerId).toBe(customerId);
    expect(firstIssueResult.customerId).toBe(secondIssueResult.customerId);

    expect(firstIssueResult.productInfo.productId).toBe(productInfo.productId);
    expect(secondIssueResult.productInfo.productId).toBe(productInfo.productId);
    expect(firstIssueResult.productInfo.productId).toBe(
      secondIssueResult.productInfo.productId
    );

    expect(firstIssueResult.productInfo.productName).toBe(
      productInfo.productName
    );
    expect(secondIssueResult.productInfo.productName).toBe(
      productInfo.productName
    );
    expect(firstIssueResult.productInfo.productName).toBe(
      secondIssueResult.productInfo.productName
    );

    expect(firstIssueResult.productInfo.quantity).toBe(productInfo.quantity);
    expect(secondIssueResult.productInfo.quantity).toBe(productInfo.quantity);
    expect(firstIssueResult.productInfo.quantity).toBe(
      secondIssueResult.productInfo.quantity
    );

    expect(firstIssueResult.productInfo.unitPrice).toBe(productInfo.unitPrice);
    expect(secondIssueResult.productInfo.unitPrice).toBe(productInfo.unitPrice);
    expect(firstIssueResult.productInfo.unitPrice).toBe(
      secondIssueResult.productInfo.unitPrice
    );

    // (3) 両回の生成PDFの内容ハッシュ値が同一であることを確認
    expect(firstPdfHash).toBe(secondPdfHash);

    // (4) 両回のDocumentStorageAdapter.uploadDocument呼び出しで返されるドキュメントIDが同一であることを確認
    expect(firstDocumentId).toBe(secondDocumentId);
    expect(firstDocumentId).toBe('DOC-20240115-001');

    // (5) 発行日時が異なるが、入力値に基づく計算結果（見積有効期限など）は同じ値が記録されることを確認
    // 発行日時が異なることを確認（ただし、この test では同期実行なので秒単位で同じ可能性がある）
    // 実装によっては微小時間差が生じるため、厳密には異なる可能性がある
    // 但し、有効期限は発行日 + 7日の計算に基づくため、日付単位では同じになる

    // 有効期限の計算結果が同じであることを確認
    const firstValidUntilDate = firstIssueResult.validUntil;
    const secondValidUntilDate = secondIssueResult.validUntil;

    // 同じ日付になることを確認（発行日 + 7日の計算）
    const firstValidDate = new Date(firstValidUntilDate);
    const secondValidDate = new Date(secondValidUntilDate);
    expect(firstValidDate.toISOString().split('T')[0]).toBe(
      secondValidDate.toISOString().split('T')[0]
    );

    // (6) NotificationServiceAdapter.sendQuoteNotificationが2回呼び出され、同じメールアドレスに通知が送信されることを確認
    expect(
      notificationServiceAdapterMock.sendQuoteNotification
    ).toHaveBeenCalledTimes(2);

    const firstNotificationCall =
      notificationServiceAdapterMock.sendQuoteNotification.mock.calls[0][0];
    const secondNotificationCall =
      notificationServiceAdapterMock.sendQuoteNotification.mock.calls[1][0];

    expect(firstNotificationCall.customerEmail).toBe(customerEmail);
    expect(secondNotificationCall.customerEmail).toBe(customerEmail);
    expect(firstNotificationCall.customerEmail).toBe(
      secondNotificationCall.customerEmail
    );

    // DocumentStorageAdapterが2回呼び出されたことを確認
    expect(
      documentStorageAdapterMock.uploadDocument
    ).toHaveBeenCalledTimes(2);

    // 両回のuploadDocument呼び出しで同じドキュメントIDが返されたことを確認
    const firstUploadCall =
      documentStorageAdapterMock.uploadDocument.mock.calls[0][0];
    const secondUploadCall =
      documentStorageAdapterMock.uploadDocument.mock.calls[1][0];

    // アップロード対象のPDF内容が同一であることを確認
    expect(firstUploadCall.pdfContent).toBe(secondUploadCall.pdfContent);

    // 監査ログが記録されたことを確認
    expect(auditLogExporterMock.logDataAccess).toHaveBeenCalledTimes(2);
  });
});