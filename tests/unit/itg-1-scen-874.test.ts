import { validateInvoice } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成と商談ステータス紐付け', () => {
  // SCEN-874
  test('請求書承認検証機能 - 請求明細に紐付く商品が存在しないとき検証が不合格になる', () => {
    // Arrange: テスト用の請求書データと明細を準備
    const invoiceId = 'INV-001';
    const customerId = 'CUST-001';
    const lineItem1Id = 'LINE-001';
    const lineItem2Id = 'LINE-002';

    const invoiceData = {
      invoiceId,
      customerId,
      totalAmount: 15000,
      lineItems: [
        {
          lineItemId: lineItem1Id,
          productId: 'PROD-001',
          quantity: 1,
          unitPrice: 10000,
          amount: 10000,
        },
        {
          lineItemId: lineItem2Id,
          productId: 'PROD-999',
          quantity: 1,
          unitPrice: 5000,
          amount: 5000,
        },
      ],
    };

    // 商品マスタのスタブを設定
    const productStub = {
      exists: (productId: string): boolean => {
        const existingProducts = ['PROD-001'];
        return existingProducts.includes(productId);
      },
    };

    // Act: validateInvoice() を呼び出す
    const result = validateInvoice(invoiceData, productStub);

    // Assert: 検証結果を検証
    expect(result.validationStatus).toBe('FAILED');
    expect(result.errorCode).toBe('PRODUCT_NOT_FOUND');
    expect(result.message).toContain('PROD-999');
    expect(result.failedLineItems).toHaveLength(1);
    expect(result.failedLineItems[0]).toEqual({
      lineItemId: lineItem2Id,
      productId: 'PROD-999',
    });
  });
});