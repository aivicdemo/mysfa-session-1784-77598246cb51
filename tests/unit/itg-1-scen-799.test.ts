import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-799
  test('請求対象データ妥当性検証機能 - 検証対象の請求データが複数件のとき、全件を検証する', () => {
    const invoiceDataA = {
      invoiceId: 'INV-001',
      amount: 10000,
      taxRate: 10,
      customerId: 'CUST-001',
      description: 'Product A',
    };

    const invoiceDataB = {
      invoiceId: 'INV-002',
      amount: 20000,
      taxRate: 10,
      customerId: 'CUST-002',
      description: 'Product B',
    };

    const invoiceDataC = {
      invoiceId: 'INV-003',
      amount: 15000,
      taxRate: 8,
      customerId: 'CUST-003',
      description: 'Product C',
    };

    const invoiceDataList = [invoiceDataA, invoiceDataB, invoiceDataC];

    const validationResult = validateInvoiceData(invoiceDataList);

    expect(validationResult.totalValidated).toBe(3);
    expect(validationResult.allValid).toBe(true);

    expect(validationResult.results).toHaveLength(3);

    expect(validationResult.results[0]).toEqual({
      invoiceId: 'INV-001',
      isValid: true,
      amountValid: true,
      taxRateValid: true,
      requiredFieldsPresent: true,
      taxIncludedAmount: 11000,
    });

    expect(validationResult.results[1]).toEqual({
      invoiceId: 'INV-002',
      isValid: true,
      amountValid: true,
      taxRateValid: true,
      requiredFieldsPresent: true,
      taxIncludedAmount: 22000,
    });

    expect(validationResult.results[2]).toEqual({
      invoiceId: 'INV-003',
      isValid: true,
      amountValid: true,
      taxRateValid: true,
      requiredFieldsPresent: true,
      taxIncludedAmount: 16200,
    });
  });
});