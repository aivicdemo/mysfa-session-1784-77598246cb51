import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import {
  updateDealStatusToContracted,
} from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-214
  test('商談ステータスを成約に変更する際、必須項目チェックで明細データが1件の場合にステータス更新が成功する', async () => {
    // テスト用モック: DocumentStorageAdapter
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'doc_20240115_001',
        storageUrl: 'https://drive.example.com/file/d/mock_file_id/view',
      }),
      generateShareLink: jest.fn().mockResolvedValue({
        shareLink: 'https://drive.example.com/file/d/mock_file_id/view?usp=sharing',
        expiresAt: new Date('2024-01-22T11:00:00Z').toISOString(),
      }),
      deleteDocument: jest.fn().mockResolvedValue({ success: true }),
    };

    // テスト用モック: NotificationServiceAdapter
    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest
        .fn()
        .mockResolvedValue({ messageId: 'msg_quote_001', status: 'sent' }),
      sendOrderNotification: jest
        .fn()
        .mockResolvedValue({ messageId: 'msg_order_001', status: 'sent' }),
      sendInvoiceNotification: jest
        .fn()
        .mockResolvedValue({ messageId: 'msg_invoice_001', status: 'sent' }),
      getDeliveryStatus: jest.fn().mockResolvedValue({
        messageId: 'msg_invoice_001',
        deliveryStatus: 'delivered',
        openedAt: '2024-01-15T14:30:00Z',
      }),
    };

    // テスト用モック: PaymentGatewayAdapter
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'plink_20240115_001',
        paymentUrl: 'https://payment.example.com/pay/plink_20240115_001',
        expiresAt: new Date('2024-02-15T11:00:00Z').toISOString(),
      }),
      verifyPayment: jest
        .fn()
        .mockResolvedValue({ transactionId: 'txn_001', status: 'completed' }),
      getTransactionStatus: jest.fn().mockResolvedValue({
        transactionId: 'txn_001',
        status: 'completed',
        paidAmount: 150000,
        paidAt: '2024-01-15T12:00:00Z',
      }),
    };

    // 入力データ: 商談レコード（ステータス: 提案中）
    const dealData = {
      dealId: 'deal_20240115_001',
      customerId: 'cust_A001',
      dealName: 'テスト案件A',
      status: 'proposal',
      targetAmount: 150000,
      proposalDate: '2024-01-10T09:00:00Z',
    };

    // 入力データ: 請求明細データ（1件）
    const invoiceLineItem = {
      lineItemId: 'line_001',
      dealId: dealData.dealId,
      productName: 'サービスA',
      quantity: 1,
      unitPrice: 150000,
      lineAmount: 150000,
    };

    // 実行: 商談ステータスを「成約」に更新
    const updateResult = await updateDealStatusToContracted(
      dealData,
      [invoiceLineItem],
      {
        documentStorageAdapter: mockDocumentStorageAdapter,
        notificationServiceAdapter: mockNotificationServiceAdapter,
        paymentGatewayAdapter: mockPaymentGatewayAdapter,
      }
    );

    // 検証1: ステータス更新成功
    expect(updateResult.success).toBe(true);

    // 検証2: 更新後のステータスが「成約」
    expect(updateResult.updatedDeal.status).toBe('contracted');

    // 検証3: 商談ID が保持されている
    expect(updateResult.updatedDeal.dealId).toBe('deal_20240115_001');

    // 検証4: 顧客ID が保持されている
    expect(updateResult.updatedDeal.customerId).toBe('cust_A001');

    // 検証5: 更新前の提案金額が保持されている
    expect(updateResult.updatedDeal.targetAmount).toBe(150000);

    // 検証6: 紐付けられた請求明細データの件数が1件
    expect(updateResult.attachedLineItems).toHaveLength(1);

    // 検証7: 紐付けられた明細データが正しい
    expect(updateResult.attachedLineItems[0].lineItemId).toBe('line_001');
    expect(updateResult.attachedLineItems[0].productName).toBe('サービスA');
    expect(updateResult.attachedLineItems[0].quantity).toBe(1);
    expect(updateResult.attachedLineItems[0].unitPrice).toBe(150000);

    // 検証8: 必須項目チェックが実行され、パスしたことを確認
    expect(updateResult.validationResult.isValid).toBe(true);
    expect(updateResult.validationResult.hasRequiredFields).toBe(true);
    expect(updateResult.validationResult.lineItemCount).toBe(1);

    // 検証9: DocumentStorageAdapter が呼び出されたことを確認
    expect(mockDocumentStorageAdapter.uploadDocument).toHaveBeenCalled();

    // 検証10: NotificationServiceAdapter が呼び出されたことを確認
    expect(mockNotificationServiceAdapter.sendInvoiceNotification).toHaveBeenCalled();

    // 検証11: PaymentGatewayAdapter が呼び出されたことを確認
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalled();

    // 検証12: ステータス履歴に「成約」への遷移が記録されている
    expect(updateResult.statusHistory).toBeDefined();
    expect(updateResult.statusHistory.previousStatus).toBe('proposal');
    expect(updateResult.statusHistory.newStatus).toBe('contracted');
    expect(updateResult.statusHistory.transitionTime).toBeDefined();
  });
});