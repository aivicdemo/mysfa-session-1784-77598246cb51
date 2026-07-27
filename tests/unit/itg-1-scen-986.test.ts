import { validateMigrationCompletion } from '../../src/logic/it-1-3';

describe('売上実績・請求状況のリアルタイム集計・レポート生成', () => {
  // SCEN-986: [edge] 移行完了判定機能 - 照合対象の請求書件数が0の場合、データ不足として移行判定が保留される
  test('SCEN-986: 請求書件数が0件の場合、移行判定ステータスは保留（PENDING）となり、データ不足メッセージが記録される', async () => {
    // Arrange: 各外部サービス連携用のスタブを作成
    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({ documentId: 'doc-stub-001' }),
      generateShareLink: jest.fn().mockResolvedValue({ shareLink: 'https://stub.example.com/share' }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    const notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn().mockResolvedValue({ messageId: 'msg-stub-001' }),
      sendOrderNotification: jest.fn().mockResolvedValue({ messageId: 'msg-stub-002' }),
      sendInvoiceNotification: jest.fn().mockResolvedValue({ messageId: 'msg-stub-003' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({ status: 'delivered' }),
    };

    const paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({ paymentLink: 'https://stub.example.com/payment' }),
      verifyPayment: jest.fn().mockResolvedValue({ verified: true }),
      getTransactionStatus: jest.fn().mockResolvedValue({ status: 'completed' }),
    };

    // 照合対象の請求書データセットを準備：件数0件の状態
    const invoiceDataset = {
      invoices: [],
      totalCount: 0,
      period: {
        startDate: '2024-04-01',
        endDate: '2024-04-30',
      },
    };

    // Act: 移行完了判定機能を実行
    const migrationDecisionResult = await validateMigrationCompletion({
      invoiceDataset: invoiceDataset,
      documentStorageAdapter: documentStorageAdapterStub,
      notificationServiceAdapter: notificationServiceAdapterStub,
      paymentGatewayAdapter: paymentGatewayAdapterStub,
    });

    // Assert: 期待結果を検証
    // 移行判定ステータスが『PENDING』に設定されていることを確認
    expect(migrationDecisionResult.migrationDecisionStatus).toBe('PENDING');

    // 判定理由が『insufficient_data』として記録されていることを確認
    expect(migrationDecisionResult.decisionReason).toBe('insufficient_data');

    // ユーザー向けメッセージが『データ不足』を示すメッセージであることを確認
    expect(migrationDecisionResult.userMessage).toMatch(/請求書データが登録されていることをご確認ください/);

    // システム管理者向けログレコードが正しく記録されていることを確認
    expect(migrationDecisionResult.adminLog).toMatchObject({
      invoice_count: 0,
      migration_decision: 'PENDING',
      reason: 'insufficient_data',
    });

    // 移行判定が完了していない（完了フラグが false）ことを確認
    expect(migrationDecisionResult.isCompleted).toBe(false);

    // 外部サービスへの不要な呼び出しがないことを確認（スタブが呼ばれていないこと）
    expect(documentStorageAdapterStub.uploadDocument).not.toHaveBeenCalled();
    expect(notificationServiceAdapterStub.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(paymentGatewayAdapterStub.generatePaymentLink).not.toHaveBeenCalled();
  });
});