import { validateInvoiceContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-243
  test('帳票内容検証機能 - 顧客情報の郵便番号が空の場合、警告を表示する', () => {
    const customerInfo = {
      customerId: 'CUST001',
      customerName: '株式会社テスト',
      postalCode: '',
      address: '東京都渋谷区1-1-1',
      phoneNumber: '03-1234-5678',
      email: 'contact@test.com',
    };

    const dealAmount = 100000;
    const dealDetails = [
      {
        itemId: 'ITEM001',
        itemName: '商品A',
        quantity: 2,
        unitPrice: 50000,
        totalPrice: 100000,
      },
    ];

    const validationResult = validateInvoiceContent(
      customerInfo,
      dealAmount,
      dealDetails
    );

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.warnings).toHaveLength(1);
    expect(validationResult.warnings[0]).toEqual({
      level: 'warning',
      field: 'postalCode',
      message: expect.stringMatching(/郵便番号/),
    });
    expect(validationResult.documentGenerated).toBe(false);
  });
});