import { validateInvoiceData } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  test('SCEN-800: 請求対象データ妥当性検証機能 - 顧客IDが欠けているとき不承認と判定', () => {
    const invalidInvoiceDataWithoutCustomerId = {
      customerId: '',
      invoiceDate: '2024-01-15',
      invoiceAmount: 150000,
      invoiceCompanyName: 'テスト会社',
      invoiceDetails: [
        {
          itemName: '商品A',
          quantity: 2,
          unitPrice: 75000
        }
      ]
    };

    const result = validateInvoiceData(invalidInvoiceDataWithoutCustomerId);

    expect(result.approved).toBe(false);
    expect(result.validationErrorCode).toBe('CUSTOMER_ID_MISSING');
    expect(result.errorMessage).toBe('顧客IDが未設定です。請求データを修正してください');
  });
});