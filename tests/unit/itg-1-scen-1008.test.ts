import { getDeliveryStatus } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能 - Google Workspace メール API連携', () => {
  // SCEN-1008: [edge] Google Workspace メール API連携 - メール送信が予期しない応答形式を返した場合、不正な配信ステータスが業務結果として通されない
  test('予期しない応答形式を返したGoogle Workspace メール APIに対してシステムがエラーハンドリングを実行し、不正な配信ステータス値を業務結果として記録しない', async () => {
    const mockNotificationServiceAdapter = {
      getDeliveryStatus: jest.fn(),
    };

    // 予期しない応答形式: 標準フィールドが欠落した応答
    const malformedResponse = {
      messageId: 'msg_12345',
      // 標準フィールド 'deliveryStatus' が欠落
      // 'status' フィールドも欠落
    };

    mockNotificationServiceAdapter.getDeliveryStatus.mockResolvedValue(
      malformedResponse
    );

    const invoiceId = 'INV-2024-001';
    const customerId = 'CUST-5678';

    // システムが予期しない応答形式を検出してエラーハンドリングを実行することを確認
    const result = await getDeliveryStatus(invoiceId, customerId, {
      notificationService: mockNotificationServiceAdapter,
    });

    // 不正な応答形式が検出されたため、配信ステータスは『未確定』または『エラー』の状態で保持される
    expect(result.status).toBe('error');
    expect(result.errorMessage).toMatch(/配信ステータスの形式が不正です/);

    // 不正な値が業務結果として確定されていないことを確認
    expect(result.deliveryConfirmed).toBe(false);

    // 代替動作が実行されることを確認: 再試行ロジックまたはメール送信キューへの保存
    expect(result.fallbackAction).toBe('queued_for_retry');

    // ユーザーへのエラーメッセージが表示される
    expect(result.userMessage).toMatch(/メール送信に失敗しました/);
  });
});