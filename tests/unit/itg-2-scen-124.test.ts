import { validateInvoiceApproval } from '../../src/logic/it-1784969823049-2-1-2';

describe('顧客向けポータル商談情報参照機能', () => {
  // SCEN-124
  test('請求書ステータスが「承認待ち」のとき、承認検証ボタンが有効で操作可能', () => {
    // Arrange: 承認待ちステータスの請求書データを準備
    const invoiceId = 'INV-20240115-001';
    const customerId = 'CUST-00123';
    const status = '承認待ち';
    const amount = 150000;
    const taxAmount = 15000;
    const totalAmount = 165000;
    const invoiceDate = '2024-01-15T10:30:00Z';
    const dueDate = '2024-02-15T23:59:59Z';

    const invoiceForValidation = {
      invoiceId,
      customerId,
      status,
      amount,
      taxAmount,
      totalAmount,
      invoiceDate,
      dueDate,
      details: [
        {
          itemId: 'ITEM-001',
          itemName: '商品A',
          quantity: 10,
          unitPrice: 10000,
          lineTotal: 100000,
        },
        {
          itemId: 'ITEM-002',
          itemName: '商品B',
          quantity: 5,
          unitPrice: 10000,
          lineTotal: 50000,
        },
      ],
    };

    // Act: 承認検証を実行
    const result = validateInvoiceApproval(invoiceForValidation);

    // Assert: 承認検証が正常に実行され、結果が返される
    expect(result).toEqual({
      isValid: true,
      invoiceId,
      status: '承認待ち',
      validationMessage: '承認検証が完了しました。承認を進めてください。',
      canApprove: true,
      checkedAt: expect.any(String),
      amountVerified: totalAmount,
      detailsCount: 2,
    });
  });
});