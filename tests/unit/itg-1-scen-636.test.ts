import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('商談ステータスと請求書発行状況の自動照合・ズレ検出機能', () => {
  // SCEN-636
  it('請求書発行日が無効な日付形式のとき、バリデーションエラーが発生する', async () => {
    // Import target logic
    const { reconcileInvoiceStatusWithDealStatus } = await import(
      '../../src/logic/it-1784969823049-1-1-1'
    );

    // Mock adapters
    const mockDocumentStorageAdapter = {
      uploadDocument: jest.fn(),
      generateShareLink: jest.fn(),
      deleteDocument: jest.fn(),
    };

    const mockNotificationServiceAdapter = {
      sendQuoteNotification: jest.fn(),
      sendOrderNotification: jest.fn(),
      sendInvoiceNotification: jest.fn(),
      getDeliveryStatus: jest.fn(),
    };

    const mockPaymentGatewayAdapter = {
      generatePaymentLink: jest.fn(),
      verifyPayment: jest.fn(),
      getTransactionStatus: jest.fn(),
    };

    // Test data with invalid invoice issue date
    const invalidInvoiceData = {
      invoiceId: 'INV-2024-001',
      dealId: 'DEAL-2024-001',
      customerId: 'CUST-001',
      invoiceAmount: 100000,
      invoiceIssuedDate: '2024-13-45', // Invalid: month 13, day 45
      invoiceStatus: 'PENDING_ISSUANCE',
      dealStatus: 'WON',
    };

    // Execute and expect validation error
    try {
      await reconcileInvoiceStatusWithDealStatus(
        invalidInvoiceData,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      );
      expect(true).toBe(false); // Should not reach here
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Verify error is thrown with correct code and message
        expect(error.message).toMatch(/日付形式/);
        
        // Verify adapters were not called
        expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
        expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
        expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
      } else {
        throw error;
      }
    }

    // Test with another invalid date format: day 32
    const anotherInvalidData = {
      invoiceId: 'INV-2024-002',
      dealId: 'DEAL-2024-002',
      customerId: 'CUST-002',
      invoiceAmount: 50000,
      invoiceIssuedDate: '2024-02-30', // Invalid: February 30
      invoiceStatus: 'PENDING_ISSUANCE',
      dealStatus: 'WON',
    };

    try {
      await reconcileInvoiceStatusWithDealStatus(
        anotherInvalidData,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      );
      expect(true).toBe(false); // Should not reach here
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.message).toMatch(/日付形式/);
        expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
        expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
        expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
      } else {
        throw error;
      }
    }

    // Test with non-date string
    const nonDateStringData = {
      invoiceId: 'INV-2024-003',
      dealId: 'DEAL-2024-003',
      customerId: 'CUST-003',
      invoiceAmount: 75000,
      invoiceIssuedDate: 'invalid-date',
      invoiceStatus: 'PENDING_ISSUANCE',
      dealStatus: 'WON',
    };

    try {
      await reconcileInvoiceStatusWithDealStatus(
        nonDateStringData,
        mockDocumentStorageAdapter,
        mockNotificationServiceAdapter,
        mockPaymentGatewayAdapter
      );
      expect(true).toBe(false); // Should not reach here
    } catch (error: unknown) {
      if (error instanceof Error) {
        expect(error.message).toMatch(/日付形式/);
        expect(mockDocumentStorageAdapter.uploadDocument).not.toHaveBeenCalled();
        expect(mockNotificationServiceAdapter.sendInvoiceNotification).not.toHaveBeenCalled();
        expect(mockPaymentGatewayAdapter.generatePaymentLink).not.toHaveBeenCalled();
      } else {
        throw error;
      }
    }
  });
});