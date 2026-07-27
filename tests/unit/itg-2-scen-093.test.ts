import { describe, test, expect, beforeEach } from '@jest/globals';
import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('Customer Portal - Invoice Approval Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // SCEN-093: [normal] 請求書承認検証機能 - 請求書に紐付く明細が1件のとき、金額と明細内容が検証される
  test('should validate invoice approval with single line item and return validation complete status', () => {
    const invoiceData = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-001',
      invoiceDate: new Date('2024-01-15T11:00:00Z'),
      totalAmount: 11000,
      lineItems: [
        {
          lineItemId: 'LINE-001',
          quantity: 10,
          unitPrice: 1100,
          amount: 11000,
        },
      ],
      status: 'pending_approval',
    };

    const result = validateInvoiceApproval(invoiceData);

    expect(result.isValid).toBe(true);
    expect(result.status).toBe('verified');
    expect(result.message).toBe('検証完了：請求書は正常です');
    expect(result.validationDetails).toEqual({
      lineItemCount: 1,
      lineItems: [
        {
          lineItemId: 'LINE-001',
          quantityValid: true,
          unitPriceValid: true,
          amountMatchesCalculation: true,
          calculatedAmount: 11000,
        },
      ],
      totalAmountMatchesLineItems: true,
      invoiceTotalAmount: 11000,
      lineItemsTotalAmount: 11000,
    });
  });
});