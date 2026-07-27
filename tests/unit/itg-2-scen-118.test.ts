import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('Invoice Approval Validation', () => {
  test('SCEN-118: should generate amount mismatch warning when invoice amount exceeds quote amount', () => {
    const dealId = 'DEAL-001';
    const quoteAmount = 100000;
    const invoiceAmount = 120000;
    const expectedDifference = 20000;

    const invoiceData = {
      dealId,
      amount: invoiceAmount,
      quoteAmount,
      status: 'PENDING_APPROVAL',
    };

    const validationResult = validateInvoiceApproval(invoiceData);

    expect(validationResult.warnings).toBeDefined();
    expect(validationResult.warnings.length).toBeGreaterThan(0);

    const amountMismatchWarning = validationResult.warnings.find(
      (w: any) => w.type === 'AMOUNT_MISMATCH'
    );

    expect(amountMismatchWarning).toBeDefined();
    expect(amountMismatchWarning.type).toBe('AMOUNT_MISMATCH');
    expect(amountMismatchWarning.message).toBe(
      `請求書金額（${invoiceAmount.toLocaleString('ja-JP')}円）が商談の見積金額（${quoteAmount.toLocaleString('ja-JP')}円）を超過しています`
    );
    expect(amountMismatchWarning.difference).toBe(expectedDifference);
    expect(amountMismatchWarning.level).toBe('WARNING');

    expect(validationResult.invoiceStatus).toBe('PENDING_APPROVAL');
    expect(validationResult.shouldDisplayWarning).toBe(true);
  });
});