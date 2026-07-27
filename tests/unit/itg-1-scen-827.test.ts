import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-827
  test('請求対象データ妥当性検証機能 - 請求金額が1円のとき、正常な金額として検証を続行する', () => {
    const invoiceDataWith1Yen = {
      invoiceAmount: 1,
      customerName: 'テスト顧客',
      customerId: 'CUST-001',
      invoiceDate: new Date('2024-01-15T11:00:00Z'),
      dueDate: new Date('2024-02-15T11:00:00Z'),
      lineItems: [
        {
          itemId: 'ITEM-001',
          description: 'テスト商品',
          quantity: 1,
          unitPrice: 1,
          amount: 1,
        },
      ],
    };

    const result = validateInvoiceData(invoiceDataWith1Yen);

    expect(result.status).toBe('合格');
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.validatedAmount).toBe(1);
  });
});