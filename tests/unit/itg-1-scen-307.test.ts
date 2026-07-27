import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { detectAmountDiscrepancy } from '../../src/logic/it-1784969823049-1-1-1';

const mockPaymentGatewayAdapter = {
  generatePaymentLink: jest.fn(),
  verifyPayment: jest.fn(),
  getTransactionStatus: jest.fn(),
};

describe('商談ステータスと請求データの紐付け・可視化 - 金額ズレ検出', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPaymentGatewayAdapter.getTransactionStatus.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-307
  test('請求書レコードの発行金額がnullのとき、金額ズレ検出がエラーをスロー', () => {
    const dealRecord = {
      id: 'deal-001',
      status: '成約',
      contractAmount: 150000,
      customerId: 'cust-001',
    };

    const invoiceRecord = {
      id: 'invoice-001',
      dealId: 'deal-001',
      issuedAmount: null,
      issuedDate: '2024-01-15',
    };

    expect(() =>
      detectAmountDiscrepancy(dealRecord, invoiceRecord, mockPaymentGatewayAdapter)
    ).toThrow(/発行金額/);

    expect(mockPaymentGatewayAdapter.getTransactionStatus).not.toHaveBeenCalled();
  });
});