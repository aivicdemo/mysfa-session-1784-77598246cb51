import { validateInvoiceAmount } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-097
  test('請求書の金額が正の値のとき、金額妥当性検証を実行する', () => {
    // Arrange
    const invoiceData = {
      invoiceId: 'INV-20240115-001',
      customerId: 'CUST-001',
      amount: 10000,
      currency: 'JPY',
      issueDate: '2024-01-15',
      dueDate: '2024-02-15',
      lineItems: [
        {
          itemId: 'ITEM-001',
          description: 'Service A',
          quantity: 1,
          unitPrice: 10000,
          subtotal: 10000,
        },
      ],
      validationStatus: '未検証',
      validationErrors: [],
    };

    // Act
    const result = validateInvoiceAmount(invoiceData);

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.validationStatus).toBe('金額妥当性検証：承認');
    expect(result.validationErrors).toEqual([]);
  });
});