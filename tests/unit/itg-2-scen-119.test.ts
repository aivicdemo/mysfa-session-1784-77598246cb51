import { validateInvoiceLineItemsMatchDealItems } from '../../src/logic/it-1784969823049-2-1-2';

describe('請求書承認検証機能 - 請求書明細と商談品目の整合性検証', () => {
  // SCEN-119
  test('請求書明細が商談から引き継がれた品目と一致するとき、明細整合性検証を成功させる', () => {
    // Arrange: テスト用の商談データを準備
    const dealItems = [
      {
        id: 'item-001',
        productId: 'prod-A',
        productName: '品目A',
        quantity: 10,
        unitPrice: 1000,
        subtotal: 10000,
      },
      {
        id: 'item-002',
        productId: 'prod-B',
        productName: '品目B',
        quantity: 5,
        unitPrice: 2000,
        subtotal: 10000,
      },
    ];

    // 商談から引き継がれた請求書明細
    const invoiceLineItems = [
      {
        id: 'invoice-line-001',
        itemId: 'item-001',
        productId: 'prod-A',
        productName: '品目A',
        quantity: 10,
        unitPrice: 1000,
        subtotal: 10000,
      },
      {
        id: 'invoice-line-002',
        itemId: 'item-002',
        productId: 'prod-B',
        productName: '品目B',
        quantity: 5,
        unitPrice: 2000,
        subtotal: 10000,
      },
    ];

    const expectedInvoiceTotal = 20000;

    // Act: 請求書承認検証機能の明細整合性検証ロジックを実行
    const validationResult = validateInvoiceLineItemsMatchDealItems(
      dealItems,
      invoiceLineItems
    );

    // Assert: 検証結果を確認
    expect(validationResult.isValid).toBe(true);
    expect(validationResult.matchedItemCount).toBe(2);
    expect(validationResult.lineItems).toHaveLength(2);
    expect(validationResult.lineItems[0]).toEqual({
      id: 'invoice-line-001',
      itemId: 'item-001',
      productId: 'prod-A',
      productName: '品目A',
      quantity: 10,
      unitPrice: 1000,
      subtotal: 10000,
    });
    expect(validationResult.lineItems[1]).toEqual({
      id: 'invoice-line-002',
      itemId: 'item-002',
      productId: 'prod-B',
      productName: '品目B',
      quantity: 5,
      unitPrice: 2000,
      subtotal: 10000,
    });
    expect(validationResult.totalAmount).toBe(expectedInvoiceTotal);
    expect(validationResult.validationStatus).toBe('成功');
  });
});