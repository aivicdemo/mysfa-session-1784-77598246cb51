import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { generateInvoiceFromDeal } from '../../src/logic/it-1-1';

const fetchMock = require('jest-fetch-mock');

describe('見積・注文・請求書の自動生成機能', () => {
  beforeEach(() => {
    fetchMock.enableMocks();
    fetchMock.resetMocks();
  });

  afterEach(() => {
    fetchMock.disableMocks();
  });

  // SCEN-595
  it('商談レコードの顧客名が空の場合、請求書生成が失敗し、Google Drive APIが呼び出されない', () => {
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const dealRecord = {
      dealId: 'DEAL-001',
      customerName: '',
      customerEmail: 'customer@example.com',
      amount: 100000,
      invoiceItems: [
        {
          itemId: 'ITEM-001',
          description: 'Service A',
          quantity: 1,
          unitPrice: 100000,
        },
      ],
    };

    const result = generateInvoiceFromDeal(
      dealRecord,
      mockDocumentStorageAdapter,
    );

    expect(result.errorCode).toBe('INVALID_REQUIRED_FIELD_CUSTOMER_NAME');
    expect(result.errorMessage).toBe(
      '請求書生成に失敗しました。商談レコードの顧客名が入力されていません。',
    );
    expect(result.invoiceStatus).toBe('生成失敗');
    expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
  });
});