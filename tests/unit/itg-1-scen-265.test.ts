import { validateQuoteContent } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  test('SCEN-265: [error] 帳票内容検証機能 - 見積明細の数量が小数を含む場合、警告を表示する', () => {
    const quoteData = {
      quoteId: 'QUOTE-20240115-001',
      customerId: 'CUST-00123',
      customerName: '株式会社テスト',
      customerEmail: 'contact@test-company.jp',
      quoteDate: '2024-01-15',
      items: [
        {
          lineNumber: 1,
          itemCode: 'ITEM-001',
          itemName: '商品A',
          quantity: 5,
          unitPrice: 10000,
          subtotal: 50000,
        },
        {
          lineNumber: 2,
          itemCode: 'ITEM-002',
          itemName: '商品B',
          quantity: 2.5,
          unitPrice: 8000,
          subtotal: 20000,
        },
        {
          lineNumber: 3,
          itemCode: 'ITEM-003',
          itemName: '商品C',
          quantity: 3,
          unitPrice: 12000,
          subtotal: 36000,
        },
      ],
      totalAmount: 106000,
      taxRate: 0.1,
      taxAmount: 10600,
      grandTotal: 116600,
    };

    const validationResult = validateQuoteContent(quoteData);

    expect(validationResult.isValid).toBe(false);
    expect(validationResult.warnings).toHaveLength(1);
    expect(validationResult.warnings[0]).toMatchObject({
      type: 'decimal_quantity',
      lineNumber: 2,
      message: '見積明細の数量に小数が含まれています。整数値での入力をお勧めします',
    });
    expect(validationResult.canSave).toBe(true);
    expect(validationResult.errors).toHaveLength(0);
  });
});