import { validateInvoiceDetails } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-831
  test('請求対象データ妥当性検証機能 - 請求明細に数量が欠けている行を含むとき、該当データを不承認と判定する', () => {
    const invoiceDetailsDataSet = [
      {
        lineNumber: 1,
        productId: 'PROD-001',
        unitPrice: 10000,
        quantity: 5,
      },
      {
        lineNumber: 2,
        productId: 'PROD-002',
        unitPrice: 20000,
        quantity: null,
      },
      {
        lineNumber: 3,
        productId: 'PROD-003',
        unitPrice: 15000,
        quantity: 3,
      },
    ];

    const validationResult = validateInvoiceDetails(invoiceDetailsDataSet);

    expect(validationResult.isValid).toBe(false);

    expect(validationResult.validationErrors.length).toBeGreaterThanOrEqual(1);

    const lineTwo_errors = validationResult.validationErrors.filter(
      (error: any) => error.lineNumber === 2
    );
    expect(lineTwo_errors.length).toBeGreaterThanOrEqual(1);

    const quantityErrorRecord = lineTwo_errors.find(
      (error: any) => error.errorCode === 'MISSING_QUANTITY'
    );
    expect(quantityErrorRecord).toBeDefined();
    expect(quantityErrorRecord.lineNumber).toBe(2);
    expect(quantityErrorRecord.errorCode).toBe('MISSING_QUANTITY');
    expect(quantityErrorRecord.errorMessage).toMatch(/数量/);
    expect(quantityErrorRecord.errorMessage).toMatch(/必須/);

    expect(validationResult.rejectionStatus).toBe('UNAPPROVED');

    const lineOne_errors = validationResult.validationErrors.filter(
      (error: any) => error.lineNumber === 1
    );
    expect(lineOne_errors.length).toBe(0);

    const lineThree_errors = validationResult.validationErrors.filter(
      (error: any) => error.lineNumber === 3
    );
    expect(lineThree_errors.length).toBe(0);
  });
});