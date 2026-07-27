import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  test('SCEN-806: 請求対象データ妥当性検証機能 - 請求金額が負数のとき、該当データを不承認と判定する', () => {
    const invoiceDataWithNegativeAmount = {
      invoiceId: 'INV-2024-001',
      customerId: 'CUST-001',
      customerName: '太郎商事',
      invoiceAmount: -10000,
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-15',
      lineItems: [
        {
          itemId: 'ITEM-001',
          itemName: '商品A',
          quantity: 2,
          unitPrice: 5000,
          lineAmount: 10000,
        },
      ],
    };

    const validationResult = validateInvoiceData(invoiceDataWithNegativeAmount);

    expect(validationResult.status).toBe('不承認');
    expect(validationResult.approved).toBe(false);
    expect(validationResult.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'invoiceAmount',
          message: expect.stringMatching(/請求金額が負数/),
        }),
      ])
    );
  });
});