import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { generateInvoice } from '../../src/logic/it-1-1';

const fetchMock = require('jest-fetch-mock');

describe('見積・注文・請求書の自動生成機能', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-587
  it('商談に紐付く見積明細が0件の場合、請求書生成が失敗する', async () => {
    const deal_id = 'DEAL-587';
    const customer_name = 'テスト太郎';
    const amount = 100000;

    const deal_record = {
      deal_id: deal_id,
      customer_name: customer_name,
      amount: amount,
      quote_details: [],
      invoice_status: '未生成',
    };

    const mock_document_storage_adapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mock_notification_service_adapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mock_payment_gateway_adapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    const result = await expect(
      generateInvoice(
        deal_record,
        mock_document_storage_adapter,
        mock_notification_service_adapter,
        mock_payment_gateway_adapter
      )
    ).rejects.toThrow(/INVOICE_GENERATION_FAILED_NO_QUOTE_DETAILS/);

    expect(mock_document_storage_adapter.uploadDocument).not.toHaveBeenCalled();
    expect(mock_notification_service_adapter.sendInvoiceNotification).not.toHaveBeenCalled();
    expect(mock_payment_gateway_adapter.generatePaymentLink).not.toHaveBeenCalled();

    expect(deal_record.invoice_status).toBe('生成失敗');
  });
});