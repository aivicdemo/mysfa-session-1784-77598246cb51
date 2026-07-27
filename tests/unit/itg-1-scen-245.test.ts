import { validateDocumentContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け - 帳票内容検証機能', () => {
  // SCEN-245: [error] 帳票内容検証機能 - 顧客情報の電話番号が空の場合、警告を表示する
  test('顧客情報の電話番号が空の場合、警告メッセージを表示し帳票生成を中断する', () => {
    const customerInfo = {
      customerId: 'CUST-001',
      customerName: 'テスト顧客A',
      email: 'test@example.com',
      phoneNumber: '',
      address: '東京都渋谷区',
    };

    const dealAmount = 150000;
    const dealDetails = [
      {
        itemId: 'ITEM-001',
        itemName: '商品A',
        quantity: 2,
        unitPrice: 75000,
      },
    ];

    const validationResult = validateDocumentContent({
      customerInfo,
      dealAmount,
      dealDetails,
    });

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.warnings).toContain(/電話番号/);
    expect(validationResult.errorColor).toBe('red');
    expect(validationResult.canProceedToGeneration).toBe(false);
  });
});