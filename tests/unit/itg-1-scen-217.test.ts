import { updateDealStatusToContracted } from '../../src/logic/it-1784969823049-2-1-1';

describe('商談レコードの進捗ステータスと提案内容の入力・保存機能', () => {
  // SCEN-217: [edge] 商談ステータス更新・請求データ紐付け機能 - 商談ステータスを成約に変更する際、必須項目チェックで商談金額が業務上の最大規模の場合にステータス更新が成功する
  test('商談金額が最大規模（999,999,999円）の場合、ステータス「成約」への更新と請求データ自動生成が成功する', () => {
    const dealId = 'DEAL-001';
    const customerId = 'CUST-12345';
    const dealAmount = 999999999;
    const dealName = 'エンタープライズ契約';
    const expectedContractDate = '2024-12-31';
    const dealCreatedAt = new Date('2024-01-15T10:00:00Z');
    const dealUpdatedAt = new Date('2024-01-15T14:30:00Z');

    const dealInput = {
      dealId: dealId,
      customerId: customerId,
      dealName: dealName,
      dealAmount: dealAmount,
      expectedContractDate: expectedContractDate,
      currentStatus: '新規',
      createdAt: dealCreatedAt,
    };

    const documentStorageAdapterStub = {
      uploadDocument: jest.fn().mockResolvedValue({
        documentId: 'DOC-2024-001',
        cloudStorageUrl: 'https://storage.example.com/invoice-DOC-2024-001.pdf',
      }),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn().mockResolvedValue({
        notificationId: 'NOTIF-2024-001',
        deliveryStatus: 'sent',
      }),
      getDeliveryStatus: jest.fn(),
    };

    const paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn().mockResolvedValue({
        paymentLinkId: 'PAYLINK-2024-001',
        paymentUrl: 'https://payment.example.com/pay/PAYLINK-2024-001',
      }),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const result = updateDealStatusToContracted(
      dealInput,
      documentStorageAdapterStub,
      notificationServiceAdapterStub,
      paymentGatewayAdapterStub
    );

    expect(result.dealId).toBe(dealId);
    expect(result.newStatus).toBe('成約');
    expect(result.previousStatus).toBe('新規');
    expect(result.dealAmount).toBe(dealAmount);
    expect(result.invoiceGenerated).toBe(true);
    expect(result.invoiceDocumentId).toBe('DOC-2024-001');
    expect(result.invoiceStorageUrl).toBe('https://storage.example.com/invoice-DOC-2024-001.pdf');
    expect(result.notificationSent).toBe(true);
    expect(result.notificationId).toBe('NOTIF-2024-001');
    expect(result.paymentLinkGenerated).toBe(true);
    expect(result.paymentLinkId).toBe('PAYLINK-2024-001');
    expect(result.paymentUrl).toBe('https://payment.example.com/pay/PAYLINK-2024-001');
    expect(result.errorMessage).toBeNull();
    expect(result.updatedAt).toBeDefined();

    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledTimes(1);
    expect(documentStorageAdapterStub.uploadDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId: dealId,
        customerId: customerId,
        dealAmount: dealAmount,
        dealName: dealName,
      })
    );

    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalledTimes(1);
    expect(notificationServiceAdapterStub.sendInvoiceNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId: dealId,
        customerId: customerId,
        invoiceDocumentId: 'DOC-2024-001',
      })
    );

    expect(paymentGatewayAdapterStub.generatePaymentLink).toHaveBeenCalledTimes(1);
    expect(paymentGatewayAdapterStub.generatePaymentLink).toHaveBeenCalledWith(
      expect.objectContaining({
        dealId: dealId,
        dealAmount: dealAmount,
        invoiceId: expect.any(String),
      })
    );
  });
});