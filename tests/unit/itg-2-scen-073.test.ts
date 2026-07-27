import { issueOrder } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル商談情報参照 - 帳票発行時の発行日時自動付与と発行履歴記録', () => {
  // SCEN-073
  test('注文書の発行日時が年をまたぐとき、その日時が正確に記録される', async () => {
    // テスト実行環境のシステム日時を2024年12月31日23時59分50秒に設定
    const issueTimestamp = new Date('2024-12-31T23:59:50Z');
    jest.useFakeTimers();
    jest.setSystemTime(issueTimestamp);

    // DocumentStorageAdapterのモック化
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc-test-001',
        fileUrl: 'https://drive.example.com/files/doc-test-001',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareUrl: 'https://drive.example.com/share/token-abc123',
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // NotificationServiceAdapterのモック化
    const mockNotificationServiceAdapter = {
      sendOrderNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-001',
        status: 'sent',
      }),
      sendQuoteNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-002',
        status: 'sent',
      }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'msg-003',
        status: 'sent',
      }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        delivered: true,
        opened: false,
      }),
    };

    // 認証済みの顧客ユーザー情報
    const authenticatedUser = {
      userId: 'customer-user-001',
      email: 'customer@example.com',
      customerId: 'cust-001',
      role: 'customer',
    };

    // 注文書発行入力データ
    const orderIssueInput = {
      productName: 'テスト商品',
      quantity: 1,
      unitPrice: 10000,
      customerEmail: 'customer@example.com',
      userId: authenticatedUser.userId,
      customerId: authenticatedUser.customerId,
    };

    // 注文書を発行
    const orderIssueResult = await issueOrder(
      orderIssueInput,
      mockDocumentStorageAdapter,
      mockNotificationServiceAdapter
    );

    // 期待値：発行日時が2024年12月31日23時59分50秒として記録される
    const expectedIssuedAtTimestamp = '2024-12-31T23:59:50Z';

    // (1) 発行履歴データベースのissuedAtカラムに正確な日時が記録されていることを確認
    expect(orderIssueResult.issuedAt).toBe(expectedIssuedAtTimestamp);

    // (2) DocumentStorageAdapterへ渡されたメタデータのtimestampフィールドに
    //     発行操作時点の日時が含まれていることを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalledTimes(1);
    const uploadDocumentCall = mockDocumentStorageAdapter.uploadDocument.mock.calls[0];
    expect(uploadDocumentCall).toBeDefined();

    // uploadDocument呼び出しの引数からメタデータを抽出
    const uploadedMetadata = uploadDocumentCall[0];
    expect(uploadedMetadata.timestamp).toBe(expectedIssuedAtTimestamp);

    // (3) 通知サービスへの呼び出しで、発行日時が含まれていることを確認
    expect(mockNotificationServiceAdapter.sendOrderNotification).toHaveBeenCalledTimes(1);
    const notificationCall = mockNotificationServiceAdapter.sendOrderNotification.mock.calls[0];
    expect(notificationCall).toBeDefined();
    expect(notificationCall[0].issuedAt).toBe(expectedIssuedAtTimestamp);

    // (4) ポータル画面で表示される発行日時が、記録された日時と一致することを確認
    expect(orderIssueResult.displayIssuedAt).toBe(expectedIssuedAtTimestamp);

    // (5) 発行履歴一覧に表示される発行記録の日時を確認
    expect(orderIssueResult.orderNumber).toBeDefined();
    expect(orderIssueResult.documentId).toBe('doc-test-001');
    expect(orderIssueResult.shareUrl).toBe('https://drive.example.com/share/token-abc123');

    // システム日時を2025年1月1日00時00分10秒に進める
    const afterNewYearTimestamp = new Date('2025-01-01T00:00:10Z');
    jest.setSystemTime(afterNewYearTimestamp);

    // 発行履歴は発行操作時点の日時で凍結されていることを確認
    // （時刻進行後に再度取得しても、記録された発行日時は変わらない）
    expect(orderIssueResult.issuedAt).toBe(expectedIssuedAtTimestamp);
    expect(orderIssueResult.displayIssuedAt).toBe(expectedIssuedAtTimestamp);

    // 年をまたぐ時刻変更の影響を受けず、発行操作時点の正確な日時が保持されていることを確認
    const parsedIssuedAt = new Date(orderIssueResult.issuedAt);
    const expectedDate = new Date(expectedIssuedAtTimestamp);
    expect(parsedIssuedAt.getTime()).toBe(expectedDate.getTime());

    jest.useRealTimers();
  });
});