import { validateInvoice } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向け専用ポータルでの商談情報参照機能', () => {
  // SCEN-051
  test('請求書検証・承認機能 - 請求書の金額が0円のとき、妥当性検証を通過する', () => {
    const invoiceData = {
      invoiceNumber: 'INV-2024-001',
      invoiceDate: '2024-01-15T11:00:00Z',
      customerName: 'テスト顧客株式会社',
      customerCode: 'CUST-001',
      amount: 0,
      taxAmount: 0,
      totalAmount: 0,
      dueDate: '2024-02-15T00:00:00Z',
      lineItems: [
        {
          itemCode: 'ITEM-001',
          description: 'サービス提供',
          quantity: 0,
          unitPrice: 0,
          lineAmount: 0
        }
      ],
      status: 'PENDING_APPROVAL'
    };

    const result = validateInvoice(invoiceData);

    expect(result).toEqual({
      isValid: true,
      errorMessages: [],
      canBeApproved: true
    });
  });
});