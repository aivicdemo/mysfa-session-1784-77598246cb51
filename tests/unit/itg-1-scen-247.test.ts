import { validateInvoiceContents } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  test('SCEN-247: 帳票内容検証機能 - 商談金額が0円の場合、警告を表示する', () => {
    // Arrange: 商談金額が0円に設定されたテストデータを作成
    const dealWithZeroAmount = {
      deal_id: 'DEAL-001',
      customer_id: 'CUST-001',
      customer_name: '株式会社テスト顧客',
      amount: 0,
      description: 'テスト商談',
      items: [
        {
          item_id: 'ITEM-001',
          product_name: 'テスト製品',
          unit_price: 0,
          quantity: 1,
          line_amount: 0,
        },
      ],
    };

    // Act: 帳票内容検証関数を呼び出し
    const validationResult = validateInvoiceContents(dealWithZeroAmount);

    // Assert: 警告メッセージが返却されることを検証
    expect(validationResult.has_warnings).toBe(true);
    expect(validationResult.warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          level: expect.stringMatching(/^(warning|alert)$/),
          message: expect.stringMatching(/商談金額が0円/),
        }),
      ]),
    );
    expect(validationResult.can_generate_document).toBe(true);
  });
});