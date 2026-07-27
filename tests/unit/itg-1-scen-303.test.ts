import { describe, test, expect, beforeEach } from '@jest/globals';
import { linkDealWithInvoices } from '../../src/logic/it-1784969823049-1-1-1';

describe('商談ステータスと請求データの紐付け・可視化', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-303
  test('請求書ステータスが「下書き」のとき、紐付け対象外として処理される', () => {
    const mockDealRecord = {
      dealId: 'DEAL-001',
      dealName: '顧客A向け商談',
      dealStatus: 'negotiation',
      customerId: 'CUST-001',
      amount: 100000,
    };

    const mockInvoiceRecords = [
      {
        invoiceId: 'INV-001',
        invoiceStatus: 'draft',
        amount: 100000,
        dealId: 'DEAL-001',
        issuedDate: '2024-04-01',
      },
    ];

    const mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const result = linkDealWithInvoices(mockDealRecord, mockInvoiceRecords, mockLogger);

    expect(result.linkedInvoices).toEqual([]);
    expect(result.excludedInvoices).toContainEqual({
      invoiceId: 'INV-001',
      reason: 'draft',
    });
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining('INV-001')
    );
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining('draft')
    );
    expect(mockLogger.debug).toHaveBeenCalledWith(
      expect.stringContaining('紐付け対象外')
    );
  });
});