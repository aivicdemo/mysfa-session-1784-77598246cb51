import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { generatePaymentLinkWithValidation } from '../../src/logic/it-1784969823049-2-1-2';

describe('GMO Payment Gateway - Invalid Response Format Handling', () => {
  // SCEN-175
  test('should reject invalid payment link response and fallback to bank transfer when generatePaymentLink returns malformed data', async () => {
    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
    };

    const invoiceId = 'INV-20240115-001';
    const amount = 150000;
    const currency = 'JPY';

    // Test case 1: Missing paymentUrl field
    mockPaymentGatewayAdapter.generatePaymentLink.mockResolvedValueOnce({
      transactionId: 'TXN-12345',
      // Missing paymentUrl field
      expiresAt: '2024-02-15T11:00:00Z',
    });

    const result1 = await generatePaymentLinkWithValidation(
      {
        invoiceId,
        amount,
        currency,
      },
      mockPaymentGatewayAdapter
    );

    expect(result1).toEqual({
      success: false,
      errorMessage: '支払いリンクの生成に失敗しました。銀行振込でお支払いください',
      fallbackMode: true,
      bankTransferInfo: {
        accountHolder: expect.any(String),
        bankName: expect.any(String),
        branchName: expect.any(String),
        accountNumber: expect.any(String),
        accountType: expect.any(String),
      },
    });

    // Test case 2: paymentUrl is null
    mockPaymentGatewayAdapter.generatePaymentLink.mockResolvedValueOnce({
      transactionId: 'TXN-12346',
      paymentUrl: null,
      expiresAt: '2024-02-15T11:00:00Z',
    });

    const result2 = await generatePaymentLinkWithValidation(
      {
        invoiceId,
        amount,
        currency,
      },
      mockPaymentGatewayAdapter
    );

    expect(result2).toEqual({
      success: false,
      errorMessage: '支払いリンクの生成に失敗しました。銀行振込でお支払いください',
      fallbackMode: true,
      bankTransferInfo: {
        accountHolder: expect.any(String),
        bankName: expect.any(String),
        branchName: expect.any(String),
        accountNumber: expect.any(String),
        accountType: expect.any(String),
      },
    });

    // Test case 3: paymentUrl is not a string
    mockPaymentGatewayAdapter.generatePaymentLink.mockResolvedValueOnce({
      transactionId: 'TXN-12347',
      paymentUrl: 12345,
      expiresAt: '2024-02-15T11:00:00Z',
    });

    const result3 = await generatePaymentLinkWithValidation(
      {
        invoiceId,
        amount,
        currency,
      },
      mockPaymentGatewayAdapter
    );

    expect(result3).toEqual({
      success: false,
      errorMessage: '支払いリンクの生成に失敗しました。銀行振込でお支払いください',
      fallbackMode: true,
      bankTransferInfo: {
        accountHolder: expect.any(String),
        bankName: expect.any(String),
        branchName: expect.any(String),
        accountNumber: expect.any(String),
        accountType: expect.any(String),
      },
    });

    // Verify retry logic: 3 attempts for first call
    expect(mockPaymentGatewayAdapter.generatePaymentLink).toHaveBeenCalledTimes(3);

    // Verify retry parameters follow exponential backoff pattern
    const calls = mockPaymentGatewayAdapter.generatePaymentLink.mock.calls;
    expect(calls[0][0]).toEqual({
      invoiceId,
      amount,
      currency,
    });
    expect(calls[1][0]).toEqual({
      invoiceId,
      amount,
      currency,
    });
    expect(calls[2][0]).toEqual({
      invoiceId,
      amount,
      currency,
    });
  });
});