import { validateInvoiceApproval } from '../../src/logic/it-1-1';

describe('見積・注文・請求書の自動生成機能', () => {
  // SCEN-909
  test('請求書承認検証機能 - 注文の金額と請求書の金額が一致するとき検証が合格する', () => {
    const orderId = 'ORD-20240115-001';
    const invoiceId = 'INV-20240115-001';
    const orderAmount = 150000;
    const invoiceAmount = 150000;
    const orderLineItems = [
      { productId: 'PROD-A', productName: 'ProductA', amount: 50000 },
      { productId: 'PROD-B', productName: 'ProductB', amount: 60000 },
      { productId: 'PROD-C', productName: 'ProductC', amount: 40000 },
    ];
    const invoiceLineItems = [
      { productId: 'PROD-A', productName: 'ProductA', amount: 50000 },
      { productId: 'PROD-B', productName: 'ProductB', amount: 60000 },
      { productId: 'PROD-C', productName: 'ProductC', amount: 40000 },
    ];

    const result = validateInvoiceApproval({
      invoiceId: invoiceId,
      orderId: orderId,
      orderAmount: orderAmount,
      invoiceAmount: invoiceAmount,
      orderLineItems: orderLineItems,
      invoiceLineItems: invoiceLineItems,
    });

    expect(result.isValid).toBe(true);
    expect(result.approvalStatus).toBe('APPROVED');
    expect(result.validationMessage).toContain('150000');
    expect(result.validationLog).toBeDefined();
  });
});