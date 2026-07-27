import { updateDealStatusAndAttachBilling } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-233
  test('商談ステータスを成約に変更した場合、NotificationServiceAdapterでメール送信が失敗してもステータス更新は成功し、代替処理に切り替わる', async () => {
    // Arrange: NotificationServiceAdapterのスタブを作成
    const notificationServiceStub = {
      sendInvoiceNotification: jest.fn().mockRejectedValue(
        new Error('Email service unavailable')
      ),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    // Arrange: データベースストアのスタブを作成
    const mockDealStore = {
      getDeal: jest.fn().mockResolvedValue({
        deal_id: 'DEAL-001',
        customer_id: 'CUST-123',
        amount: 1000000,
        status: 'negotiation',
        created_at: '2024-01-15T09:00:00Z',
      }),
      updateDeal: jest.fn().mockResolvedValue({
        deal_id: 'DEAL-001',
        customer_id: 'CUST-123',
        amount: 1000000,
        status: 'closed',
        updated_at: '2024-01-15T11:00:00Z',
      }),
    };

    const mockInvoiceStore = {
      getInvoiceByDealId: jest.fn().mockResolvedValue({
        invoice_id: 'INV-001',
        deal_id: 'DEAL-001',
        customer_id: 'CUST-123',
        amount: 1000000,
        status: 'draft',
        created_at: '2024-01-15T09:30:00Z',
      }),
      updateInvoiceStatus: jest.fn().mockResolvedValue({
        invoice_id: 'INV-001',
        deal_id: 'DEAL-001',
        customer_id: 'CUST-123',
        amount: 1000000,
        status: 'confirmed',
        updated_at: '2024-01-15T11:00:00Z',
      }),
    };

    const mockNotificationQueueStore = {
      addToQueue: jest.fn().mockResolvedValue({
        queue_id: 'QUEUE-001',
        recipient: 'CUST-123',
        type: 'invoice',
        status: 'pending',
        created_at: '2024-01-15T11:00:00Z',
      }),
    };

    // Act: 商談ステータス更新APIを呼び出し
    const result = await updateDealStatusAndAttachBilling(
      {
        deal_id: 'DEAL-001',
        new_status: 'closed',
      },
      notificationServiceStub,
      mockDealStore,
      mockInvoiceStore,
      mockNotificationQueueStore
    );

    // Assert: NotificationServiceAdapterが呼び出されたことを確認
    expect(notificationServiceStub.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_id: 'CUST-123',
        invoice_id: 'INV-001',
      })
    );

    // Assert: 商談ステータスが更新されたことを確認
    expect(mockDealStore.updateDeal).toHaveBeenCalledWith('DEAL-001', {
      status: 'closed',
    });

    // Assert: 請求レコードステータスが確定に更新されたことを確認
    expect(mockInvoiceStore.updateInvoiceStatus).toHaveBeenCalledWith(
      'INV-001',
      'confirmed'
    );

    // Assert: メール送信キューにレコードが保存されたことを確認
    expect(mockNotificationQueueStore.addToQueue).toHaveBeenCalledWith(
      expect.objectContaining({
        recipient: 'CUST-123',
        type: 'invoice',
        status: 'pending',
      })
    );

    // Assert: APIレスポンスのHTTPステータスコードは200
    expect(result.status_code).toBe(200);

    // Assert: 商談レコードのステータスは「成約」に更新されている
    expect(result.deal).toEqual(
      expect.objectContaining({
        deal_id: 'DEAL-001',
        status: 'closed',
      })
    );

    // Assert: 請求レコードのステータスは「確定」に更新されている
    expect(result.invoice).toEqual(
      expect.objectContaining({
        invoice_id: 'INV-001',
        status: 'confirmed',
      })
    );

    // Assert: APIレスポンスボディに警告メッセージが含まれている
    expect(result.warning_message).toMatch(/メール送信に失敗しました/);
    expect(result.warning_message).toMatch(/手動で顧客に連絡してください/);

    // Assert: メール送信キュー情報が結果に含まれている
    expect(result.notification_queue).toEqual(
      expect.objectContaining({
        recipient: 'CUST-123',
        type: 'invoice',
        status: 'pending',
      })
    );

    // Assert: 代替処理が実行されたことを確認
    expect(result.fallback_executed).toBe(true);
  });
});