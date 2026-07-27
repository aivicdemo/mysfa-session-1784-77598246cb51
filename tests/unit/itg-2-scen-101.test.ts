import { describe, test, expect } from '@jest/globals';
import { validatePaymentDeadline } from '../../src/logic/it-1784969823049-2-1-2';

describe('Invoice Approval Validation - Payment Deadline Check', () => {
  // SCEN-101
  test('should throw ValidationError when payment deadline is same day as issue date', () => {
    const issueDate = new Date('2024-01-15T00:00:00Z');
    const paymentDeadlineDate = new Date('2024-01-15T00:00:00Z');

    const invoiceData = {
      invoiceId: 'INV-2024-001',
      issuedDate: issueDate,
      paymentDeadlineDate: paymentDeadlineDate,
      customerId: 'CUST-123',
      totalAmount: 100000,
      currency: 'JPY',
    };

    expect(() => validatePaymentDeadline(invoiceData)).toThrow(/INVOICE_INVALID_PAYMENT_DEADLINE/);
  });
});