import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 請求対象データ妥当性検証', () => {
  // SCEN-798
  test('検証対象の請求データが1件のとき、その1件を個別に検証する', () => {
    const invoiceDataToValidate = {
      invoiceNumber: 'INV-20240115-001',
      customerId: 'CUST-12345',
      invoiceAmount: 150000,
      invoiceDate: '2024-01-15',
      lineItems: [
        {
          itemName: '商品A',
          quantity: 2,
          unitPrice: 50000,
        },
        {
          itemName: 'サービスB',
          quantity: 1,
          unitPrice: 50000,
        },
      ],
      taxAmount: 16500,
    };

    const validationResult = validateInvoiceData([invoiceDataToValidate]);

    expect(validationResult.totalRecordsValidated).toBe(1);
    expect(validationResult.validationCompletionMessage).toBe(
      '検証完了：1件のデータを検証しました'
    );

    expect(validationResult.records).toHaveLength(1);
    expect(validationResult.records[0]).toEqual({
      invoiceNumber: 'INV-20240115-001',
      checks: {
        invoiceNumberUniqueness: 'OK',
        customerIdExists: 'OK',
        invoiceAmountGreaterThanZero: 'OK',
        invoiceDateFormat: 'OK',
        lineItemsExist: 'OK',
        taxCalculationAccurate: 'OK',
      },
    });

    expect(validationResult.overallResult).toBe('合格');
    expect(validationResult.validationResultMessage).toBe(
      '検証結果：合格'
    );
    expect(validationResult.validationLogId).toBeDefined();
    expect(typeof validationResult.validationLogId).toBe('string');
  });
});