import { validateInvoiceTargetData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-841
  test('請求対象データ妥当性検証機能 - 月末日が請求期日のとき、その日付を有効な期日として検証を続行する', () => {
    const invoiceTargetData = {
      invoiceId: 'INV-20240229-001',
      customerId: 'CUST-A001',
      customerName: '株式会社テスト',
      amount: 100000,
      currency: 'JPY',
      items: [
        {
          description: 'サービスA',
          quantity: 1,
          unitPrice: 100000,
        },
      ],
      dueDate: new Date('2024-02-29T00:00:00Z'),
      invoiceDate: new Date('2024-02-15T00:00:00Z'),
      status: 'pending',
    };

    const result = validateInvoiceTargetData(invoiceTargetData);

    expect(result.isValid).toBe(true);
    expect(result.status).toMatch(/有効|続行/);
    expect(result.errors).toEqual([]);
    expect(result.canProceedToNextStep).toBe(true);
  });
});