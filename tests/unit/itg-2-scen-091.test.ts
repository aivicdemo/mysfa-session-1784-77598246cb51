import { issueLargeAmountInvoice } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-091: [edge] 帳票発行時の発行日時自動付与と発行履歴記録 - 帳票の金額が業務上の最大規模のときも発行履歴が記録される
  test('最大金額の請求書発行時に発行履歴が完全に記録される', () => {
    const customerId = 'CUST-001';
    const customerEmail = 'customer@example.com';
    const maxInvoiceAmount = 999999999;
    const invoiceType = 'invoice';
    const documentId = 'DOC-20240115-001';
    const issuedAtTime = new Date('2024-01-15T11:00:00Z');

    // DocumentStorageAdapter スタブ: uploadDocument が正常にアップロード完了を返す
    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: documentId,
        uploadedAt: issuedAtTime.toISOString(),
        status: 'uploaded',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    // NotificationServiceAdapter スタブ: sendInvoiceNotification がメール送信成功を返す
    const notificationServiceAdapterStub = {
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        messageId: 'MSG-20240115-001',
        deliveryStatus: 'sent',
        sentAt: issuedAtTime.toISOString(),
      }),
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const invoicePayload = {
      customerId: customerId,
      customerEmail: customerEmail,
      amount: maxInvoiceAmount,
      invoiceType: invoiceType,
      items: [
        {
          itemId: 'ITEM-001',
          description: 'サービス提供',
          quantity: 1,
          unitPrice: maxInvoiceAmount,
        },
      ],
    };

    // 帳票発行処理を実行
    const result = issueLargeAmountInvoice(
      invoicePayload,
      documentStorageAdapterStub,
      notificationServiceAdapterStub,
      issuedAtTime
    );

    // 発行履歴レコードが1件追加されたことを確認
    expect(result.invoiceHistory).toHaveLength(1);

    const addedRecord = result.invoiceHistory[0];

    // 追加されたレコードの全項目を検証
    expect(addedRecord.customerId).toBe(customerId);
    expect(addedRecord.invoiceType).toBe(invoiceType);
    expect(addedRecord.amount).toBe(maxInvoiceAmount);
    expect(addedRecord.issuedAt).toEqual(issuedAtTime);
    expect(addedRecord.documentId).toBe(documentId);
    expect(addedRecord.status).toBe('発行済');

    // DocumentStorageAdapter の uploadDocument が呼ばれたことを確認
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledTimes(1);

    // NotificationServiceAdapter の sendInvoiceNotification が呼ばれたことを確認
    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        customerId: customerId,
        customerEmail: customerEmail,
        amount: maxInvoiceAmount,
      })
    );
  });
});