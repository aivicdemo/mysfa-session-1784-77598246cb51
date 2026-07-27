import { describe, test, expect, beforeEach } from '@jest/globals';
import { verifyDealStatusAndInvoiceLinkage } from '../../src/logic/it-1-2';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  let documentStorageAdapterStub: {
    uploadDocument: jest.Mock;
    generateShareLink: jest.Mock;
    deleteDocument: jest.Mock;
  };
  let notificationServiceAdapterStub: {
    sendQuoteNotification: jest.Mock;
    sendOrderNotification: jest.Mock;
    sendInvoiceNotification: jest.Mock;
    getDeliveryStatus: jest.Mock;
  };
  let paymentGatewayAdapterStub: {
    generatePaymentLink: jest.Mock;
    verifyPayment: jest.Mock;
    getTransactionStatus: jest.Mock;
  };

  beforeEach(() => {
    documentStorageAdapterStub = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };
    notificationServiceAdapterStub = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };
    paymentGatewayAdapterStub = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };
  });

  // SCEN-669
  test('商談ステータスが提案中のとき、請求書の紐付けは行われない', () => {
    const dealData = {
      dealId: 'DEAL-001',
      dealName: 'テスト商談A',
      customerName: 'テスト顧客',
      customerId: 'CUST-001',
      amount: 1000000,
      status: '提案中',
      createdAt: new Date('2024-01-15T10:00:00Z'),
    };

    const result = verifyDealStatusAndInvoiceLinkage(
      dealData,
      documentStorageAdapterStub,
      notificationServiceAdapterStub,
      paymentGatewayAdapterStub,
    );

    expect(result.invoiceLinked).toBe(false);
    expect(result.linkedInvoiceId).toBeNull();
    expect(result.linkedInvoiceRecords).toEqual([]);
    expect(documentStorageAdapterStub.uploadDocument).not.toHaveBeenCalled();
    expect(documentStorageAdapterStub.generateShareLink).not.toHaveBeenCalled();
    expect(documentStorageAdapterStub.deleteDocument).not.toHaveBeenCalled();
    expect(notificationServiceAdapterStub.sendQuoteNotification).not.toHaveBeenCalled();
    expect(notificationServiceAdapterStub.sendOrderNotification).not.toHaveBeenCalled();
    expect(notificationServiceAdapterStub.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(notificationServiceAdapterStub.getDeliveryStatus).not.toHaveBeenCalled();
    expect(paymentGatewayAdapterStub.generatePaymentLink).not.toHaveBeenCalled();
    expect(paymentGatewayAdapterStub.verifyPayment).not.toHaveBeenCalled();
    expect(paymentGatewayAdapterStub.getTransactionStatus).not.toHaveBeenCalled();
  });
});