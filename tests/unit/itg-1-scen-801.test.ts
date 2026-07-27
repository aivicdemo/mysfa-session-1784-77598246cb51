import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-801
  test('請求対象データ妥当性検証機能 - 請求データの商談IDが欠けているとき、該当データを不承認と判定する', () => {
    const invoiceData = {
      customerId: 'CUST001',
      invoiceAmount: 50000,
      invoiceDate: '2024-01-15',
      dealId: null,
    };

    const result = validateInvoiceData(invoiceData);

    expect(result.status).toBe('rejected');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(/商談ID/);
  });
});