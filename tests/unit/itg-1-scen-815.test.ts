import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 請求対象データ妥当性検証', () => {
  // SCEN-815
  test('異なる顧客IDの請求データが複数含まれるとき、全て検証対象にする', () => {
    const invoiceDataSet = [
      {
        customerId: 'C001',
        amount: 100000,
        invoiceDate: '2024-04-15',
        details: 'Product A - Unit: 100, Price: 1000',
        dealId: 'D001',
        status: 'pending',
      },
      {
        customerId: 'C002',
        amount: 250000,
        invoiceDate: '2024-04-16',
        details: 'Product B - Unit: 50, Price: 5000',
        dealId: 'D002',
        status: 'pending',
      },
      {
        customerId: 'C003',
        amount: 75000,
        invoiceDate: '2024-04-17',
        details: 'Product C - Unit: 25, Price: 3000',
        dealId: 'D003',
        status: 'pending',
      },
    ];

    const result = validateInvoiceData(invoiceDataSet);

    expect(result.totalRecordsProcessed).toBe(3);
    expect(result.validRecords).toBe(3);
    expect(result.invalidRecords).toBe(0);
    expect(result.validationDetails).toHaveLength(3);

    expect(result.validationDetails[0]).toEqual({
      customerId: 'C001',
      amount: 100000,
      isValid: true,
      errors: [],
    });
    expect(result.validationDetails[1]).toEqual({
      customerId: 'C002',
      amount: 250000,
      isValid: true,
      errors: [],
    });
    expect(result.validationDetails[2]).toEqual({
      customerId: 'C003',
      amount: 75000,
      isValid: true,
      errors: [],
    });

    expect(result.allDataProcessed).toBe(true);
  });
});