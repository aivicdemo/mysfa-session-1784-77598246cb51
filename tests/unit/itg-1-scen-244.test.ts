import { validateDocumentContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-244: [error] 帳票内容検証機能 - 顧客情報の住所が空の場合、警告を表示する
  test('should display warning and halt document generation when customer address is empty', () => {
    const customerInfo = {
      name: '山田太郎',
      email: 'yamada@example.com',
      phone: '090-1234-5678',
      address: '',
    };

    const invoiceLineItems = [
      {
        itemId: 'ITEM001',
        description: '商品A',
        quantity: 1,
        unitPrice: 10000,
      },
    ];

    const dealAmount = 10000;

    const result = validateDocumentContent({
      customerInfo,
      invoiceLineItems,
      dealAmount,
    });

    expect(result.status).toBe('検証エラー');
    expect(result.isValid).toBe(false);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        field: 'address',
        message: '住所が未入力です。帳票を生成する前に入力してください',
      })
    );
    expect(result.documentGenerated).toBe(false);
  });
});